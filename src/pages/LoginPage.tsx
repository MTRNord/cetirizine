import './LoginPage.scss';
import Login from '../components/login/login';
import { memo } from 'react';

const LoginPage = memo(() => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-img">
            <Login />
        </div>
    );
})

export default LoginPage;
