import { ReactElement, useContext } from "react";
import { Navigate } from "react-router-dom";
import { MatrixContext } from "./sdk/client";

export const ProtectedRoute = ({ children }: { children: ReactElement<any, any> }) => {
    const matrixClient = useContext(MatrixContext);
    if (!matrixClient.isLoggedIn) {
        // user is not authenticated
        return <Navigate to="login" />;
    }
    return children;
};