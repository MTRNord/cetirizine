import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "./hooks";

export const ProtectedRoute = ({ children }: { children: ReactElement<any, any> }) => {
    const accessToken = useAppSelector(state => state.api.accessToken);
    if (!accessToken) {
        // user is not authenticated
        return <Navigate to="login" />;
    }
    return children;
};