import { useState } from 'react';
import { ApiActions } from '../../app/api/api';
import { getLoginError, setBaseUrl } from '../../app/api/reducers';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import Button from '../button/button';
import Header from '../header/header';
import Input from '../input/basic/input';

export function Login() {
    const loginError = useAppSelector((state: RootState) => getLoginError(state));
    const [homeserver, setHomeserver] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();

    return (
        <div className="flex flex-col rounded-md shadow p-4 bg-white gap-2">
            <Header>Login</Header>
            {loginError ? <h2 className='text-red-500 font-normal text-sm'>{loginError}</h2> : <></>}
            <Input
                value={homeserver}
                autoFocus={true}
                placeholder="Homeserver"
                onChange={e => { setHomeserver(e.target.value); dispatch(setBaseUrl(e.target.value)) }}
            />
            <Input
                value={username}
                placeholder="Username"
                onChange={e => setUsername(e.target.value)}
            />
            <Input
                value={password}
                password={true}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
            />
            <Button
                style="primary"
                type="button"
                onClick={() => dispatch({ type: ApiActions.LOGIN })}
            >
                Login
            </Button>
        </div>
    );
}