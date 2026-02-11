//useExpenseSplitter.js
import { useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import ExpenseSplitterABI from "../constants/ExpenseSplitterABI.json";
import { useWallet } from "../context/WalletContext";

//MODEL: Given a contract address, how do I talk to that contract?

// Takes in an address 
export const useExpenseSplitter = (address) => {

    const { signer} = useWallet();

    //States
    const [groupName, setGroupName] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


// 1. Create a Contract instance
    const contract = useMemo(() => {
        if (!signer || !address) return null;
        return new ethers.Contract(
        address,
        ExpenseSplitterABI,
        signer
        );
    }, [address, signer]);



// 2. Expose read functions (uses signer)~

    
    const getGroupName = useCallback(async () => {
        if(!contract) return;

        setLoading(true);
        setError(null);
        try {
            const groupName = await contract.name();
            setGroupName(groupName);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract]);



    // Get members
    const getMembers = useCallback(async () => {
        if(!contract) return;

        setLoading(true);
        setError(null);
        try {
            const membersData = await contract.getMembers();
            setMembers(membersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract]);


    // Get expenses
    const getExpenses  = useCallback(async () => {
        if(!contract) return;

        setLoading(true);
        setError(null);
        try {
            const expenseData = await contract.getExpenses();
            setExpenses(expenseData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract]);


    // Get balances
    const getBalances = useCallback(async () => {
        if(!contract) return;

        setLoading(true);
        setError(null);
        try {
            const [memberData, balanceData] = await contract.getAllBalances();

            const uiData = memberData.map((addr, i) => ({
                address: addr,
                balance: balanceData[i]
            }));
            setBalances(uiData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract]);



// 3. Expose write functions
    // Add members
    const addMember = useCallback(async (memberAddress) => {
        setLoading(true);
        setError(null);
        try {
            const tx = await contract.addMember(memberAddress);
            await tx.wait();
            await getMembers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract, getMembers]);

    // Remove member
    const removeMember = useCallback(async (memberId) => {
        setLoading(true);
        setError(null);
        try {
            const tx = await contract.removeMember(memberId);
            await tx.wait();
            await getMembers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract, getMembers]);

    // Remove self
    const removeSelf = useCallback(async (memberId) => {
        setLoading(true);
        setError(null);
        try {
            const tx = await contract.removeSelf(memberId);
            await tx.wait();
            await getMembers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract, getMembers]);

    // Add expenses
    const addExpense = useCallback(async (amount, description) => {
        setLoading(true);
        setError(null);
        try {
            const tx = await contract.addExpense(amount, description);
            await tx.wait();
            await getExpenses();
            await getBalances();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract, getExpenses, getBalances]);

    // Settle debt by sending ETH to creditor
    const settleDebtWithEth = useCallback(async (creditorAddress, weiAmount) => {
        setLoading(true);
        setError(null);
        try {
            const tx = await contract.settleDebtWithEth(creditorAddress, { value: weiAmount });
            await tx.wait();
            await getBalances();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract, getBalances]);


    return {
        contract,
        groupName,
        members,
        expenses,
        balances,
        loading,
        error,
        getGroupName,
        getMembers,
        getExpenses,
        getBalances,
        addMember,
        removeMember,
        removeSelf,
        addExpense,
        settleDebtWithEth
    }

} 