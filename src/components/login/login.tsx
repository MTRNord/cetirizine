import { useState } from 'react';
import { getLoginError, setBaseUrl } from '../../app/api/reducers';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import Button from '../button/button';
import './login.scss';

export function Login() {
    const loginError = useAppSelector((state: RootState) => getLoginError(state));
    const [homeserver, setHomeserver] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();

    return (
        <div className="loginForm">
            <h1>Login</h1>
            {loginError ? <span className='errorMsg'>{loginError}</span> : <></>}
            <input
                value={homeserver}
                type="text"
                autoFocus={true}
                placeholder="Homeserver"
                onChange={e => { setHomeserver(e.target.value); dispatch(setBaseUrl(e.target.value)) }}
            />
            <input
                value={username}
                type="text"
                placeholder="Username"
                onChange={e => setUsername(e.target.value)}
            />
            <input
                value={password}
                type="password"
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
            />
            <Button
                style="primary"
                type="button"
            >
                Login
            </Button>
        </div>
    );
}