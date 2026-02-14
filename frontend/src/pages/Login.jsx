//Login.jsx

import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from "../context/WalletContext";
import '../styles/login.css'


const Login = () =>  {
    const navigate = useNavigate();

    const { connectWallet, walletConnected } = useWallet();


    useEffect(() => {
        if(walletConnected) {
            navigate("/");
        }
    }, [walletConnected, navigate])

    return (
        <div className="loginWrapper">

            <div className="loginHeader">
                <h3>ExpenseSplittr</h3>
            </div>

            <div className="connectBtnContainer">
                <button className="connectBtn" onClick={connectWallet}>
                    {walletConnected ? "Connected" : "Connect"}
                </button>
            </div>
        </div>
    )
}

export default Login;