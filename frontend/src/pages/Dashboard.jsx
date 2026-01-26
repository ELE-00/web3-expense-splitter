//Dashboard.jsx

import React from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from "../context/WalletContext";


const Dashboard = () =>  {
    const navigate = useNavigate();
    const { disconnectWallet, account } = useWallet();

    const handleDisconnect = () => {
        disconnectWallet();
        navigate('/login');
    }

    return (
        <div>
            <h1>Dashboard PAGE</h1>
            <p>Connected Account: {account}</p>
            <button onClick={handleDisconnect}>
                Disconnect Wallet
            </button>
        </div>
    )
}

export default Dashboard;