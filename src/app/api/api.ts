import axios, { AxiosResponse } from "axios";
import { all, call, fork, put, select, takeEvery } from "redux-saga/effects";
import { RootState } from "../store";
import { LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS } from "./reducers";

export const getAccessToken = (state: RootState) => state.api.accessToken;
export const getBaseUrl = (state: RootState) => state.api.baseUrl;

export enum ApiActions {
    LOGIN = "LOGIN",

    SYNC = "SYNC",
    SYNC_REQUEST = "SYNC_REQUEST",
    SYNC_SUCCESS = "SYNC_SUCCESS",
    SYNC_FAILURE = "SYNC_FAILURE",
}

function sync(baseUrl: string, accessToken: string): Promise<AxiosResponse<any, any>> {
    return axios.get("/sync", {
        params: {},
        baseURL: baseUrl,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

function login(baseUrl: string): Promise<AxiosResponse<any, any>> {
    return axios.get("/login", {
        params: {},
        baseURL: baseUrl,
    });
}

function* onSyncSaga(): any {
    try {
        yield put({ type: ApiActions.SYNC_REQUEST });
        const accessToken: string = yield select(getAccessToken);
        const baseUrl: string = yield select(getBaseUrl);
        const response = yield call(sync, baseUrl, accessToken);
        const data = response.data;
        yield put({ type: ApiActions.SYNC_SUCCESS, data });
    } catch (e) {
        yield put({
            type: ApiActions.SYNC_FAILURE,
            payload: (e as any).toString(),
        });
    }
}

function* onLoginSaga(): any {
    try {
        yield put({ type: LOGIN_REQUEST });
        const baseUrl: string = yield select(getBaseUrl);
        if (!baseUrl.startsWith("https://")) {
            yield put({
                type: LOGIN_FAILURE,
                payload: "Homeserver url must start with https://",
            });
            return;
        }

        const response = yield call(login, baseUrl);
        const data = response.data;
        yield put({ type: LOGIN_SUCCESS, data });
    } catch (e) {
        yield put({
            type: LOGIN_FAILURE,
            payload: (e as any).toString(),
        });
    }
}

function* watchLoginSaga() {
    yield takeEvery(ApiActions.LOGIN, onLoginSaga);
}

function* syncLoginSaga() {
    yield takeEvery(ApiActions.SYNC, onSyncSaga);
}

export function* apiSagas() {
    yield all([fork(watchLoginSaga), fork(syncLoginSaga)]);
}
