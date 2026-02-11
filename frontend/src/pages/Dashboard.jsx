//Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from "../context/WalletContext";
import '../styles/dashboard.css'
import { useExpenseSplitter } from "../hooks/useExpenseSplitter";

import Sidebar from "../components/Sidebar";
import GroupOverview from "../components/GroupOverview";
import BalanceBreakdown from "../components/BalanceBreakdown";
import ExpenseList from "../components/ExpenseList";




const Dashboard = () =>  {
    const navigate = useNavigate();
    const { disconnectWallet, account } = useWallet();
    const [selectedGroupAddress, setSelectedGroupAddress] = useState(null);
    const [weiPerCent , setWeiPerCent ] = useState(null);

    const {
        contract,
        groupName,
        members,
        expenses,
        balances,
        getGroupName,
        getMembers,
        getExpenses,
        getBalances,
        addMember,
        removeMember,
        removeSelf,
        addExpense,
        settleDebtWithEth
    } = useExpenseSplitter(selectedGroupAddress);

    
    useEffect(() => {
        if (!contract) return;

        const fetchData = async () => {
            await getGroupName();
            await getMembers();
            await getExpenses();
            await getBalances();

            // Chainlink only works on testnets, not local Hardhat
            try {
                const weiData = await contract.getWeiPerCent();
                setWeiPerCent(weiData);
            } catch (err) {
                console.log("Chainlink not available (local network?)", err);
                setWeiPerCent(null);
            }
        }
        fetchData();
    }, [getGroupName, getMembers, getExpenses, getBalances, contract])


    //Disconnect
    const handleDisconnect = () => {
        disconnectWallet();
        navigate('/login');
    }


    return (
        <div className="DashboardWrapper">
            
            <div className="SidebarWrapper">
                <Sidebar setSelectedGroupAddress={setSelectedGroupAddress} selectedGroupAddress={selectedGroupAddress} account={account} handleDisconnect={handleDisconnect}></Sidebar>
            </div>


            <div className="DashWrapper">

                <div className="DashLeftSection">
                    <GroupOverview 
                    groupName={groupName} 
                    members={members} 
                    balances={balances} 
                    expenses={expenses} 
                    account={account}
                    weiPerCent={weiPerCent}
                    selectedGroupAddress={selectedGroupAddress}
                    ></GroupOverview>
                    
                    <BalanceBreakdown
                    balances={balances}
                    selectedGroupAddress={selectedGroupAddress}
                    account={account}
                    addMember={addMember}
                    getMembers={getMembers}
                    getBalances={getBalances}
                    removeMember={removeMember}
                    removeSelf={removeSelf}
                    weiPerCent={weiPerCent}
                    settleDebtWithEth={settleDebtWithEth}
                    ></BalanceBreakdown>
                </div>
                <div className="DashRightSection">
                    <ExpenseList
                    expenses={expenses}
                    addExpense={addExpense}
                    weiPerCent={weiPerCent}
                    ></ExpenseList>
                </div>
            </div>

        </div>
    )
}

export default Dashboard;