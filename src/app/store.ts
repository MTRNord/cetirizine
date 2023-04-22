import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/rootSaga";
import { apiLoginReducer } from "./api/reducers";
import { initMatrixClient } from "./api/api";

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];

export const store = configureStore({
  reducer: {
    login: apiLoginReducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    ...middlewares,
  ],
  preloadedState: await getInitialState()
});
sagaMiddleware.run(rootSaga);

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
  if (accessToken && baseUrl && userId) {
    const client = await initMatrixClient(baseUrl, userId, accessToken);
    return {
      login: {
        client,
        loginPending: false
      }
    }
  } else {
    return undefined
  }
}