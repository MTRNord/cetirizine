import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { matrixApi, auth } from "./api/api";
import { setupListeners } from "@reduxjs/toolkit/dist/query/react";
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistCombineReducers, persistStore } from "reduxjs-toolkit-persist";
import createIdbStorage from '@piotr-cz/redux-persist-idb-storage'

const persistConfig = {
  key: 'root',
  version: 1,
  storage: createIdbStorage({ name: 'cetirizine', storeName: 'cetirizine' }),
  serialize: false,
  deserialize: false,
}

const persistedReducer = persistCombineReducers(
  persistConfig,
  {
    auth: auth,
    [matrixApi.reducerPath]: matrixApi.reducer,
  }
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
    matrixApi.middleware,
  ],
});

setupListeners(store.dispatch)

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;