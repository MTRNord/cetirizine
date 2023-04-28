import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "./hooks";

export const ProtectedRoute = ({ children }: { children: ReactElement<any, any> }) => {
    const client = useAppSelector(state => state.auth.host);

    // TODO: relaunch a client if we can and skip login
    if (!client) {
        // user is not authenticated
        return <Navigate to="login" />;
    }
    return children;
};