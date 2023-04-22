import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { LOGIN_REQUEST_ACTION, LOGIN_SUCCESS_ACTION, LOGIN, LOGIN_ACTION, LOGIN_FAILURE_ACTION } from "./reducers";
import { IndexedDBCryptoStore, IndexedDBStore, MatrixClient, MemoryStore, createClient, setCryptoStoreFactory } from "matrix-js-sdk";
import { AutoDiscovery } from 'matrix-js-sdk/lib/autodiscovery';

async function login(baseUrl: string, userId: string, password: string): Promise<MatrixClient> {
    const client = await initMatrixClient(baseUrl, userId, undefined, password);

    window.localStorage.setItem("accessToken", client.getAccessToken()!);
    window.localStorage.setItem("baseUrl", client.baseUrl);
    window.localStorage.setItem("userId", client.getUserId()!);

    return client;
}

function* onLoginSaga(action: LOGIN): any {
    yield put(LOGIN_REQUEST_ACTION());
    if (!action.baseUrl.startsWith("https://")) {
        yield put(LOGIN_FAILURE_ACTION("Homeserver url must start with https://"));
        return;
    }
    if (!action.username) {
        yield put(LOGIN_FAILURE_ACTION("Username must be a non empty string"));
        return;
    }
    if (!action.password) {
        yield put(LOGIN_FAILURE_ACTION("Password must be a non empty string"));
        return;
    }
    try {
        const client: MatrixClient = yield call(login, action.baseUrl, action.username, action.password);
        yield put(LOGIN_SUCCESS_ACTION(client));
    } catch (e) {
        yield put(LOGIN_FAILURE_ACTION((e as any).toString()));
        return;
    }
}

function* watchLoginSaga() {
    yield takeEvery<LOGIN>(LOGIN_ACTION, onLoginSaga);
}

export function* apiSagas() {
    yield all([fork(watchLoginSaga)]);
}

export async function initMatrixClient(baseUrl: string, userId: string, accessToken?: string, password?: string): Promise<MatrixClient> {
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

    const clientConfig = await AutoDiscovery.findClientConfig(baseUrl.replace("https://", ''));

    if (clientConfig["m.homeserver"].state === AutoDiscovery.FAIL_PROMPT) {
        throw Error(clientConfig["m.homeserver"].error?.toString())
    }
    if (clientConfig["m.homeserver"].state !== AutoDiscovery.FAIL_ERROR) {
        if (clientConfig["m.homeserver"].base_url) {
            baseUrl = clientConfig["m.homeserver"].base_url;
        }
    }

    const matrixClient = createClient({
        baseUrl: baseUrl,
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