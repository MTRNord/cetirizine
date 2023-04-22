import { Action, createAction, createReducer } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { MatrixClient } from "matrix-js-sdk";

interface ApiLoginStatus {
    loginPending: boolean
    error?: string
    client?: MatrixClient
}

export const LOGIN_ACTION = "api/LOGIN";
export const LOGIN_REQUEST_ACTION = createAction('api/LOGIN_REQUEST');
export const LOGIN_SUCCESS_ACTION = createAction<MatrixClient>('api/LOGIN_SUCCESS');
export const LOGIN_FAILURE_ACTION = createAction<string>('api/LOGIN_FAILURE');

export interface LOGIN extends Action { type: typeof LOGIN_ACTION, baseUrl: string, username: string, password: string };


const initialLoginState: ApiLoginStatus = { loginPending: false, error: undefined, client: undefined };


export const apiLoginReducer = createReducer(initialLoginState, (builder) => {
    builder
        .addCase(LOGIN_REQUEST_ACTION, (state, _) => {
            state.loginPending = true;
            state.error = undefined;
        })
        // @ts-ignore: Somehow this state is causing issues here since its written but not read. TS6133
        .addCase(LOGIN_SUCCESS_ACTION, (state, action) => {
            state = initialLoginState;
            state.client = action.payload
        })
        .addCase(LOGIN_FAILURE_ACTION, (state, action) => {
            state.loginPending = false;
            state.error = action.payload
        })
});

export function getLoginError(state: RootState): string | undefined {
    return state.login.error
}