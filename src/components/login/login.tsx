import { memo, useContext, useState } from 'react';
import Button from '../button/button';
import Header from '../header/header';
import Input from '../input/basic/input';
import { Navigate } from 'react-router-dom';
import { MatrixContext } from '../../app/sdk/client';

const Login = memo(() => {
    const matrixClient = useContext(MatrixContext);
    const [loginPending, setLoginPending] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    if (matrixClient.isLoggedIn) {
        //@ts-ignore
        if (!globalThis.IS_STORYBOOK) {
            return <Navigate to="/" />;
        }
    }
    const startLogin = async () => {
        setLoginPending(true);
        const error = await matrixClient.passwordLogin(username, password);
        if (error) {
            setLoginError(error.toString());
        }
        setLoginPending(false);
    }
    return (
        <form className="flex flex-col rounded-md shadow p-4 bg-white dark:bg-slate-900 gap-2 min-w-[30rem]" onSubmit={(e) => {
            e.preventDefault();
            startLogin();
        }}>
            <Header>Login</Header>
            {loginError ? <h2 className='text-red-500 font-normal text-sm'>{loginError}</h2> : <div className='min-h-[1.25rem]'></div>}
            <Input
                readonly={loginPending}
                value={username}
                placeholder="Username"
                onChange={e => setUsername(e.target.value)}
            />
            <Input
                readonly={loginPending}
                value={password}
                password={true}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
            />
            <Button
                readonly={loginPending}
                style="primary"
                type="submit"
            >
                Login
            </Button>
        </form>
    );
})

export default Login;