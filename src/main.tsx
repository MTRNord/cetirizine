/// <reference types="./@types/global.d.ts" />
import React from 'react'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistor, store } from './app/store';
import App from './App';
import './index.scss';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<span>Loading...</span>} persistor={persistor}>
        <App />
      </PersistGate>

    </Provider>
  </React.StrictMode>
);