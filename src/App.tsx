import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import { ProtectedRoute } from './app/protectedRoute';

function App() {
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    </BrowserRouter>;
}

export default App;
