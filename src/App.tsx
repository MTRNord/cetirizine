import {
    HashRouter,
    Route,
    Routes,
} from "react-router-dom";
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import { ProtectedRoute } from './app/protectedRoute';
import { memo } from "react";

function App() {
    console.log("Rendering App")
    return <HashRouter>
        <Routes>
            <Route path="/:roomIdOrAlias?" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    </HashRouter>;
}

export default memo(App);
