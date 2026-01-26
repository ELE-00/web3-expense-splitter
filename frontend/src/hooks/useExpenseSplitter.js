//useExpenseSplitter.js
import React, { useState } from "react";
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


// 1. Create a Contract instance
if(!signer) return {
    members: [],
    expenses: [],
    getMembers: () => {},
    getExpenses: () => {},
    getBalance: () => {}
};

const contract = new ethers.Contract(address, ExpenseSplitterABI, signer)

// 2. Expose read functions (uses signer)
// Get members
async function getMembers() {

    try {
        const membersData = await contract.getMembers();
        setMembers(membersData)
    } catch (err) {
        console.log(err)
    }
} 
// Get expenses
async function getExpenses() {
    try {
        const expenseData = await contract.getExpenses();
        setExpenses(expenseData)
    } catch (err) {
        console.log(err)
    }
}

// Get balances
async function getBalances() {
    try {
        const [memberData, balanceData] = await contract.getAllBalances();
        
        const uiData = memberData.map((address, i) => ({
            address,
            balance: balanceData[i]
        })) 
        setBalances(uiData)
    } catch (err) {
        console.log(err)
    }
}

// 3. Expose write functions
// add members
// add expenses


// 4. Expose loading / error state
// loading
// error


return {
    members,
    expenses,
    balances,
    getMembers,
    getExpenses,
    getBalances
}

    
} 