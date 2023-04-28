import { useDeferredValue, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setHost, useDoLoginMutation, useLazyGetWellKnownQuery } from '../../app/api/api';
import Button from '../button/button';
import Header from '../header/header';
import Input from '../input/basic/input';
import { Navigate } from 'react-router-dom';

export function Login() {
    const [login, { isLoading: loginPending, error: loginError }] = useDoLoginMutation();
    const [triggerWellKnown, _result, _lastPromiseInfo] = useLazyGetWellKnownQuery();
    const deferredLoginError = useDeferredValue(loginError);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginPendingLast, setLoginPendingLast] = useState(false);
    const dispatch = useAppDispatch();

    if (loginPendingLast !== loginPending) {
        return <Navigate to="/" />;
    }
    const startLogin = async () => {
        dispatch(setHost(`https://${username.split(':')[1]}`));
        await triggerWellKnown(undefined);
        login({
            type: 'm.login.password',
            identifier: {
                type: 'm.id.user',
                user: username,
            },
            user: username,
            password: password
        })
        setLoginPendingLast(true);
    }
    // TODO: We need to make sure that we do well-known before login
    return (
        <form className="flex flex-col rounded-md shadow p-4 bg-white gap-2 min-w-[30rem]" onSubmit={(e) => {
            e.preventDefault();
            startLogin();
        }}>
            <Header>Login</Header>
            {deferredLoginError ? <h2 className='text-red-500 font-normal text-sm'>{'error' in deferredLoginError ? deferredLoginError.error : ('data' in deferredLoginError ? JSON.stringify(deferredLoginError.data) : deferredLoginError.message)}</h2> : <div className='min-h-[1.25rem]'></div>}
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
}