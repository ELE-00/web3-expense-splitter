//Login.jsx

import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from "../context/WalletContext";


const Login = () =>  {
    const navigate = useNavigate();

    const { connectWallet, walletConnected } = useWallet();


    useEffect(() => {
        if(walletConnected) {
            navigate("/");
        }
    }, [walletConnected, navigate])

    return (
        <div>
            <button onClick={connectWallet}>
                {walletConnected ? "Connected" : "Connect"}
            </button>
        </div>
    )
}

export default Login;