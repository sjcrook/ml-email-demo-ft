import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store";

const AuthenticatedPages = () => {
    const { auth } = useAuthStore();

    if (!auth?.authenticated) {
        return <Navigate to={'/signin'} replace />;
    }
    
    return <Outlet />;
};

export default AuthenticatedPages;