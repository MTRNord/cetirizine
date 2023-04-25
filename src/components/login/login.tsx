import { useDeferredValue, useState } from 'react';
import { getLoginError } from '../../app/api/reducers';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import Button from '../button/button';
import Header from '../header/header';
import Input from '../input/basic/input';
import { LOGIN_ACTION } from '../../app/api/reducers';

export function Login() {
    const loginError = useAppSelector((state: RootState) => getLoginError(state));
    const deferredLoginError = useDeferredValue(loginError);
    const loginPending = useAppSelector((state: RootState) => state.login.loginPending);
    const [homeserver, setHomeserver] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();

    return (
        <form className="flex flex-col rounded-md shadow p-4 bg-white gap-2 min-w-[30rem]" onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: LOGIN_ACTION, baseUrl: homeserver, username: username, password: password });
        }}>
            <Header>Login</Header>
            {deferredLoginError ? <h2 className='text-red-500 font-normal text-sm'>{deferredLoginError}</h2> : <div className='min-h-[1.25rem]'></div>}
            <Input
                readonly={loginPending}
                value={homeserver}
                autoFocus={true}
                placeholder="Homeserver"
                onChange={e => setHomeserver(e.target.value)}
            />
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
                onClick={() => dispatch({ type: LOGIN_ACTION, baseUrl: homeserver, username: username, password: password })}
            >
                Login
            </Button>
        </form>
    );
}