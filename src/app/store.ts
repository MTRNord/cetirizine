import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { matrixApi, auth } from "./api/api";
import { setupListeners } from "@reduxjs/toolkit/dist/query/react";

export const store = configureStore({
  reducer: {
    auth: auth,
    [matrixApi.reducerPath]: matrixApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    matrixApi.middleware,
  ],
  //preloadedState: await getInitialState()
});

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

async function getInitialState() {
  const localStorage = window.localStorage;
  const accessToken = localStorage.getItem("accessToken");
  const baseUrl = localStorage.getItem("baseUrl");
  const userId = localStorage.getItem("userId");
  const deviceId = localStorage.getItem("deviceId");
  if (accessToken && baseUrl && userId) {
    //const client = await initMatrixClient(baseUrl, userId, deviceId!, accessToken, undefined, true);
    return {
      login: {
        //client,
        loginPending: false
      }
    }
  } else {
    return undefined
  }
}