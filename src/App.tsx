import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import { ProtectedRoute } from './app/protectedRoute';
import { memo } from "react";

function App() {
    return <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
            <Route path="/:roomIdOrAlias?" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    </BrowserRouter>;
}

export default memo(App);
