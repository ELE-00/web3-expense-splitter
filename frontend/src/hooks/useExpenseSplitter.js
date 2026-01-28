//useExpenseSplitter.js
import { useState } from "react";
import { ethers } from "ethers";
import ExpenseSplitterABI from "../constants/ExpenseSplitterABI.json";
import { useWallet } from "../context/WalletContext";

//MODEL: Given a contract address, how do I talk to that contract?

// Takes in an address 
export const useExpenseSplitter = (address) => {

    const { signer} = useWallet();

    //States
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


// 1. Create a Contract instance
    if(!signer) return {
        members: [],
        expenses: [],
        balances: [],
        loading: false,
        error: null,
        getMembers: () => {},
        getExpenses: () => {},
        getBalances: () => {},
        addMember: () => {},
        removeMember: () => {},
        removeSelf: () => {},
        addExpense: () => {},
        settleExpense: () => {}
    };

    const contract = new ethers.Contract(address, ExpenseSplitterABI, signer)


// 2. Expose read functions (uses signer)
    // Get members
    async function getMembers() {
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
    }

    // Get expenses
    async function getExpenses() {
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
    }

    // Get balances
    async function getBalances() {
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
    }



// 3. Expose write functions
    // Add members
    async function addMember(memberAddress) {
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
    }

    // Remove member
    async function removeMember(memberId) {
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
    }

    // Remove self
    async function removeSelf(memberId) {
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
    }

    // Add expenses
    async function addExpense(amount, description) {
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
    }

    // Settle expense
    async function settleExpense(expenseId) {
        setLoading(true);
        setError(null);
        try {
            const tx = await contract.settleExpense(expenseId);
            await tx.wait();
            await getExpenses();
            await getBalances();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }



    return {
        members,
        expenses,
        balances,
        loading,
        error,
        getMembers,
        getExpenses,
        getBalances,
        addMember,
        removeMember,
        removeSelf,
        addExpense,
        settleExpense
    }

} 