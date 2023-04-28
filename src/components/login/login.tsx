import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setHost, useDoLoginMutation, useLazyGetLoginFlowsQuery, useLazyGetWellKnownQuery } from '../../app/api/api';
import Button from '../button/button';
import Header from '../header/header';
import Input from '../input/basic/input';
import { Navigate } from 'react-router-dom';

export function Login() {
    const [login, { isLoading: loginPending, isSuccess, error: loginErrorRaw }] = useDoLoginMutation();
    const [triggerWellKnown] = useLazyGetWellKnownQuery();
    const [triggerLoginFlows] = useLazyGetLoginFlowsQuery();
    const [loginError, setLoginError] = useState(loginErrorRaw);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();

    if (isSuccess) {
        return <Navigate to="/" />;
    }
    const startLogin = async () => {
        dispatch(setHost(`https://${username.split(':')[1]}`));
        const { isError, error } = await triggerWellKnown(undefined);
        if (isError) {
            setLoginError(error);
            return;
        }
        const { data } = await triggerLoginFlows(undefined, true);
        if ((data?.flows?.filter((flow) => flow.type === 'm.login.password')?.length || 0) > 0) {
            const payload = await login({
                type: 'm.login.password',
                identifier: {
                    type: 'm.id.user',
                    user: username,
                },
                user: username,
                password: password
            });
            if ('error' in payload) {
                if (JSON.stringify(payload.error).includes('M_LIMIT_EXCEEDED')) {
                    setLoginError({ status: "CUSTOM_ERROR", error: 'Too many attempts, try again later' });
                    return;
                }
                if (JSON.stringify(payload.error).includes('M_FORBIDDEN')) {
                    setLoginError({ status: "CUSTOM_ERROR", error: (payload.error as any).data.error });
                    return;
                }
                setLoginError(payload.error);
                return;
            }
        } else {
            setLoginError({ status: "CUSTOM_ERROR", error: 'No password login flow found' });
        }
    }
    // TODO: We need to make sure that we do well-known before login
    return (
        <form className="flex flex-col rounded-md shadow p-4 bg-white gap-2 min-w-[30rem]" onSubmit={(e) => {
            e.preventDefault();
            startLogin();
        }}>
            <Header>Login</Header>
            {loginError ? <h2 className='text-red-500 font-normal text-sm'>{'error' in loginError ? loginError.error : ('data' in loginError ? JSON.stringify(loginError.data) : loginError.message)}</h2> : <div className='min-h-[1.25rem]'></div>}
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