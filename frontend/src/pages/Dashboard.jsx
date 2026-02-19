//Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from "../context/WalletContext";
import '../styles/dashboard.css'
import { useExpenseSplitter } from "../hooks/useExpenseSplitter";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/parseError";

import Sidebar from "../components/Sidebar";
import GroupOverview from "../components/GroupOverview";
import BalanceBreakdown from "../components/BalanceBreakdown";
import ExpenseList from "../components/ExpenseList";
import DashboardSkeleton from "../components/DashboardSkeleton";




const Dashboard = () =>  {
    const navigate = useNavigate();
    const { disconnectWallet, account } = useWallet();
    const { showToast } = useToast();
    const [selectedGroupAddress, setSelectedGroupAddress] = useState(null);
    const [weiPerCent , setWeiPerCent ] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [prevAccount, setPrevAccount] = useState(account);

    // Reset selected group when the wallet account changes
    if (prevAccount !== account) {
        setPrevAccount(account);
        setSelectedGroupAddress(null);
    }

    const {
        contract,
        groupName,
        owner,
        members,
        expenses,
        balances,
        loading,
        submitting,
        error,
        getGroupName,
        getOwner,
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
        if (error) showToast(parseError(error));
    }, [error, showToast]);


    useEffect(() => {
        if (!contract) return;

        const fetchData = async () => {
            await getGroupName();
            await getOwner();
            await getMembers();
            await getExpenses();
            await getBalances();

            // Chainlink only works on testnets, not local Hardhat
            try {
                const weiData = await contract.getWeiPerCent();
                setWeiPerCent(weiData);
            } catch {
                setWeiPerCent(null);
            }
        }
        fetchData();
    }, [getGroupName, getOwner, getMembers, getExpenses, getBalances, contract])


    //Disconnect
    const handleDisconnect = () => {
        disconnectWallet();
        navigate('/login');
    }


    return (
        <div className="DashboardWrapper">

            <div className={`SidebarWrapper ${sidebarOpen ? 'open' : ''}`}>
                <Sidebar
                    setSelectedGroupAddress={setSelectedGroupAddress}
                    selectedGroupAddress={selectedGroupAddress}
                    account={account}
                    handleDisconnect={handleDisconnect}
                    onClose={() => setSidebarOpen(false)}
                ></Sidebar>
            </div>

            <div className={`sidebarOverlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            <div className="mainContent">

                <div className="mobileTopBar">
                    <button className="menuBtn" onClick={() => setSidebarOpen(true)}>☰</button>
                </div>

                {!selectedGroupAddress ? (
                    <div className="noGroupSelected">
                        <p>Select a group from the sidebar to get started</p>
                    </div>
                ) : loading && members.length === 0 ? (
                    <DashboardSkeleton />
                ) : (
                <div className="DashWrapper">

                    <div className="DashLeftSection">
                        <GroupOverview
                        groupName={groupName}
                        members={members}
                        balances={balances}
                        expenses={expenses}
                        account={account}
                        weiPerCent={weiPerCent}
                        submitting={submitting}
                        selectedGroupAddress={selectedGroupAddress}
                        addMember={addMember}
                        getMembers={getMembers}
                        getBalances={getBalances}
                        ></GroupOverview>

                        <BalanceBreakdown
                        balances={balances}
                        selectedGroupAddress={selectedGroupAddress}
                        account={account}
                        owner={owner}
                        addMember={addMember}
                        getMembers={getMembers}
                        getBalances={getBalances}
                        removeMember={removeMember}
                        removeSelf={removeSelf}
                        weiPerCent={weiPerCent}
                        submitting={submitting}
                        settleDebtWithEth={settleDebtWithEth}
                        onSelfRemoved={() => setSelectedGroupAddress(null)}
                        ></BalanceBreakdown>
                    </div>
                    <div className="DashRightSection">
                        <ExpenseList
                        expenses={expenses}
                        addExpense={addExpense}
                        weiPerCent={weiPerCent}
                        submitting={submitting}
                        ></ExpenseList>
                    </div>
                </div>
                )}

            </div>

        </div>
    )
}

export default Dashboard;