//ProtectedRoute.jsx

import { useWallet } from "../context/WalletContext";
import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoute = () => {
    const { walletConnected } = useWallet();

    // If not connected, redirect to login
    if (!walletConnected) {
        return <Navigate to="/login" replace/>;
    }

    // If connected, render protected content
    return <Outlet />;
}

export default ProtectedRoute;