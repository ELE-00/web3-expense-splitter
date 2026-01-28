//Dashboard.jsx

import React from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from "../context/WalletContext";
import '../styles/dashboard.css'


import Sidebar from "../components/Sidebar";


const Dashboard = () =>  {
    const navigate = useNavigate();
    const { disconnectWallet, account } = useWallet();

    const handleDisconnect = () => {
        disconnectWallet();
        navigate('/login');
    }

    return (
        <div className="DashboardWrapper">
            
            <div className="SidebarWrapper">
                <Sidebar></Sidebar>
            </div>


            <div className="DashWrapper">
                <h1>Dashboard PAGE</h1>
                <p>Connected Account: {account}</p>
                <button onClick={handleDisconnect}>
                    Disconnect Wallet
                </button>
            </div>

        </div>
    )
}

export default Dashboard;