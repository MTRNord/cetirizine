/// <reference types="./@types/global.d.ts" />
import { LoggerLevel, Tracing, initAsync, start } from "@matrix-org/matrix-sdk-crypto-js";
import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.scss';

initAsync().then(() => {
  if (Tracing.isAvailable()) {
    console.log("Tracing is available, turning on");
    let tracing = new Tracing(LoggerLevel.Trace);
    tracing.turnOn();
  }
  start();

  import('./app/sdk/client').then(({ MatrixContext, defaultMatrixClient }) => {
    import('./App').then(({ default: App }) => {
      const container = document.getElementById('root')!;
      const root = createRoot(container);

      root.render(
        <React.StrictMode>
          <MatrixContext.Provider value={defaultMatrixClient}>
            <App />
          </MatrixContext.Provider>
        </React.StrictMode>
      );
    })

  })
})
