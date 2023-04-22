import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/rootSaga";
import { apiLoginReducer } from "./api/reducers";

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
