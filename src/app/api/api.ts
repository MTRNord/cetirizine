import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { LOGIN_REQUEST_ACTION, LOGIN_SUCCESS_ACTION, LOGIN, LOGIN_ACTION, LOGIN_FAILURE_ACTION } from "./reducers";
import { IndexedDBCryptoStore, IndexedDBStore, MatrixClient, MemoryStore, createClient, setCryptoStoreFactory } from "matrix-js-sdk";

function login(baseUrl: string, userId: string, password: string): Promise<MatrixClient> {
    return initMatrixClient(baseUrl, userId, undefined, password);
}

function* onLoginSaga(action: LOGIN): any {
    try {
        yield put(LOGIN_REQUEST_ACTION());
        if (!action.baseUrl.startsWith("https://")) {
            yield put(LOGIN_FAILURE_ACTION("Homeserver url must start with https://"));
            return;
        }

        const client = yield call(login, action.baseUrl, action.username, action.password);
        yield put(LOGIN_SUCCESS_ACTION(client));
    } catch (e) {
        yield put(LOGIN_FAILURE_ACTION((e as any).toString()));
    }
}

function* watchLoginSaga() {
    yield takeEvery<LOGIN>(LOGIN_ACTION, onLoginSaga);
}

export function* apiSagas() {
    yield all([fork(watchLoginSaga)]);
}

async function initMatrixClient(baseURL: string, userId: string, accessToken?: string, password?: string): Promise<MatrixClient> {
    // just *accessing* indexedDB throws an exception in firefox with indexeddb disabled.
    let indexedDB: IDBFactory | undefined;
    try {
        indexedDB = global.indexedDB;
    } catch (e) { }

    // if our browser (appears to) support indexeddb, use an indexeddb crypto store.
    let store = new MemoryStore({ localStorage: window.localStorage });
    if (indexedDB) {
        setCryptoStoreFactory(() => new IndexedDBCryptoStore(indexedDB!, "matrix-js-sdk:crypto"));
        store = new IndexedDBStore({ indexedDB: indexedDB, localStorage: window.localStorage });
        await store.startup();
    }

    const matrixClient = createClient({
        baseUrl: baseURL,
        accessToken: accessToken,
        userId: accessToken ? userId : undefined,
        useAuthorizationHeader: true,
        store
    });

    if (!accessToken && !password) {
        throw Error("Missing password and accessToken. Unable to proceed")
    }

    if (!accessToken) {
        await matrixClient.loginWithPassword(userId, password!!);
    }

    await matrixClient.initCrypto();
    return matrixClient
}