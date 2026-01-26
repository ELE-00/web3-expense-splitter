//WalletContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../constants/networks";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const SEPOLIA_CHAIN_ID = NETWORKS.SEPOLIA;

    //states
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [walletConnected, setwalletConnected] = useState(false);
    const [chainId, setchainId] = useState(null);

    const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID.chainIdHex;

    //functions
    const connectWallet = async () => {
        if(!window.ethereum) {
            setErrorMessage('Need to install MetaMask');
            return;
        }

        try {
            //Request account
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            const userAccount = accounts[0];

            //Create provider
            const web3Provider = new ethers.BrowserProvider(window.ethereum);

            //Create signer
            const web3Signer = await web3Provider.getSigner();

            //Update states
            setAccount(userAccount);
            setProvider(web3Provider);
            setSigner(web3Signer);
            setwalletConnected(true);

            //Check network
            await checkNetwork();

            console.log("Wallet Connected");
            console.log("Account:", userAccount);
            console.log("Provider:", web3Provider);
            console.log("Signer:", web3Signer);

        } catch(err) {
            setErrorMessage(err.message);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setwalletConnected(false);
        setErrorMessage(null);
        console.log("Wallet disconnected");
    };

    //Network Switch
    const switchToSepolia = async () => {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{chainId: SEPOLIA_CHAIN_ID.chainIdHex}]
            });
        } catch(err) {
            setErrorMessage(err.message);
        }
    };

    //Check Network
    const checkNetwork = async () => {
        if(!window.ethereum) {
            return;
        }
        const currentChainId = await window.ethereum.request({method: "eth_chainId"});
        setchainId(currentChainId);
    };

    //MetaMask listeners
    useEffect(() => {
        if(!window.ethereum) return;

        // Check initial network on mount
        checkNetwork();

        const handleChainChanged = (newChainId) => {
            setchainId(newChainId);
        };

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                setAccount(accounts[0]);
            }
        };

        window.ethereum.on("chainChanged", handleChainChanged);
        window.ethereum.on("accountsChanged", handleAccountsChanged);

        return () => {
            window.ethereum.removeListener("chainChanged", handleChainChanged);
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        };
    }, []);

    return (
        <WalletContext.Provider value={{
            account,
            provider,
            signer,
            chainId,
            errorMessage,
            walletConnected,
            isCorrectNetwork,
            connectWallet,
            disconnectWallet,
            switchToSepolia
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};
