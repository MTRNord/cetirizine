import './LoginPage.scss';
import Login from '../components/login/login';
import { memo, useContext, useEffect, useState } from 'react';
import { MatrixContext } from '../app/sdk/client';
import { SDKError } from '../app/sdk/utils';

const LoginPage = memo(() => {
    const matrixClient = useContext(MatrixContext);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (loading) {
            // Ensure logout worked
            matrixClient.logout().then((error) => {
                if (error instanceof SDKError) {
                    console.error(error)
                }
                setLoading(false)
            });
        }
    }, [loading, matrixClient])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-img">
                <div className="flex flex-col rounded-md shadow p-4 bg-white gap-2 min-w-[30rem]">
                    <h1 className="text-2xl font-bold text-center">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-img">
            <Login />
        </div>
    );
})

export default LoginPage;
