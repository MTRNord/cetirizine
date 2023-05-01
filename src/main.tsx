/// <reference types="./@types/global.d.ts" />
import React from 'react'
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.scss';
import { enableMapSet, enablePatches } from "immer"
import { MatrixContext, defaultMatrixClient } from './app/sdk/client';

enableMapSet();
enablePatches();

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <MatrixContext.Provider value={defaultMatrixClient}>
      <App />
    </MatrixContext.Provider>
  </React.StrictMode>
);