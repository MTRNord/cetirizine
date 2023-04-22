import React from 'react'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.scss';

const container = document.getElementById('root')!;
const root = createRoot(container);

// js-sdk helper
window.Olm = await import("olm");

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);