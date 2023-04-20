import { createAction, createReducer } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface ApiState {
    accessToken?: string
    baseUrl?: string
}

export const setAccessToken = createAction<string>('api/setAccessToken');
export const setBaseUrl = createAction<string>('api/setBaseUrl');

const initialApiState: ApiState = { accessToken: undefined, baseUrl: undefined };


export const apiDataReducer = createReducer(initialApiState, (builder) => {
    builder
        .addCase(setAccessToken, (state, action) => {
            state.accessToken = action.payload;
        })
        .addCase(setBaseUrl, (state, action) => {
            // TODO: Do we well-known here?
            state.baseUrl = action.payload;
        })
});

interface ApiLoginStatus {
    loginPending: boolean
    error?: string
}

export const LOGIN_REQUEST = createAction('api/LOGIN_REQUEST');
export const LOGIN_SUCCESS = createAction<any>('api/LOGIN_SUCCESS');
export const LOGIN_FAILURE = createAction<string>('api/LOGIN_FAILURE');

const initialLoginState: ApiLoginStatus = { loginPending: false, error: undefined };


export const apiLoginReducer = createReducer(initialLoginState, (builder) => {
    builder
        .addCase(LOGIN_REQUEST, (state, action) => {
            state.loginPending = true;
            state.error = undefined;
        })
        .addCase(LOGIN_SUCCESS, (state, action) => {
            state = initialLoginState;
        })
        .addCase(LOGIN_FAILURE, (state, action) => {
            state.loginPending = false;
            state.error = action.payload
        })
});

export function getLoginError(state: RootState): string | undefined {
    return state.login.error
}