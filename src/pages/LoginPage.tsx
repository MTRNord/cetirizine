import './LoginPage.scss';
import { Login } from '../components/login/login';

function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-img">
            <Login />
        </div>
    );
}

export default LoginPage;
