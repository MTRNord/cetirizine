import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import olmWasmPath from "olm/olm.wasm?url";
import OlmLegacy from 'olm/olm_legacy.js?url';
import Olm from "olm";
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import { ProtectedRoute } from './app/protectedRoute';

Olm
    .init({
        locateFile: () => olmWasmPath,
    })
    .then(() => {
        console.log("Using WebAssembly Olm");
    })
    .catch((wasmLoadError: any) => {
        console.log("Failed to load Olm: trying legacy version", wasmLoadError);
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = OlmLegacy;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
        })
            .then(() => {
                // Init window.Olm, ie. the one just loaded by the script tag,
                // not 'Olm' which is still the failed wasm version.
                return window.Olm.init();
            })
            .then(() => {
                console.log("Using legacy Olm");
            })
            .catch((legacyLoadError) => {
                console.log("Both WebAssembly and asm.js Olm failed!", legacyLoadError);
            });
    });

function App() {
    return <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
            <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    </BrowserRouter>;
}

export default App;
