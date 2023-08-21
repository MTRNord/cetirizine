import { initAsync, start } from "@mtrnord/matrix-sdk-crypto-js";
import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.scss';
import ReactModal from "react-modal";

initAsync().then(() => {
  // if (Tracing.isAvailable()) {
  //   console.log("Tracing is available, turning on");
  //   let tracing = new Tracing(LoggerLevel.Info);
  //   tracing.turnOn();
  // }
  console.log("Crypto starting")
  start();
  console.log("Crypto started")

  import('./app/sdk/client').then(({ MatrixContext, defaultMatrixClient }) => {
    import('./App').then(({ default: App }) => {
      console.log("Starting App")
      const container = document.getElementById('root')!;
      const root = createRoot(container);

      ReactModal.setAppElement('#root');

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
