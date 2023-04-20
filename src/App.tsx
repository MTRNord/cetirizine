import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './app/protectedRoute';

function MainPage() {
    return <span>Placeholder</span>
}

function App() {
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    </BrowserRouter>;
}

export default App;
