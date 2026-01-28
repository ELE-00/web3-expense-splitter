//useExpenseSplitterFactory.js
import { useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import ExpenseSplitterFactoryABI from "../constants/ExpenseSplitterFactoryABI.json";
import { useWallet } from "../context/WalletContext";
import { EXPENSE_SPLITTER_FACTORY_ADDRESS } from "../constants/contracts";


export const useExpenseSplitterFactory = () => {

    const { signer} = useWallet();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);



    const contract = useMemo(() => {
        if (!signer) return null;
        return new ethers.Contract(
        EXPENSE_SPLITTER_FACTORY_ADDRESS,
        ExpenseSplitterFactoryABI,
        signer
        );
    }, [signer]);


    // Get contract
    const getGroups = useCallback(async () => {
        if(!contract) return;

        setLoading(true);
        setError(null);

        try {
            const groupData = await contract.getGroups();
            setGroups(groupData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract]);



    // Create contract
    const createGroup = useCallback(async (name) => {
        setLoading(true);
        setError(null);

        try {
            const tx = await contract.createGroup(name);
            await tx.wait();
            await getGroups();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract, getGroups]);



    return {
        groups,
        loading,
        error,
        getGroups,
        createGroup
    }
}