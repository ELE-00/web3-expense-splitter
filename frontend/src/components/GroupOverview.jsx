//GroupOverview.jsx
import React, { useState } from "react";
import { useMemo } from "react";
import { ethers } from "ethers";
import '../styles/groupOverview.css'
import addAccountIcon from "../assets/addAccountIcon.png";

import {setMemberName} from "../utils/groupMembers";
import AddMembersDialog from "./AddMembersDialog";

const GroupOverview = ({
    groupName, 
    members, 
    balances, 
    expenses, 
    account, 
    weiPerCent, 
    addMember, 
    getMembers, 
    getBalances, 
    selectedGroupAddress
}) => {

    const [openAMDialog, setAMOpenDialog] = useState(false);

    const handleAMDialogOpen = () => {
        setAMOpenDialog(true);
    }

    const handleAMDialogClose = () => {
        setAMOpenDialog(false);
    }

      //handle adding members
    async function addMemberToGroup(name, userAddress, groupAddress) {
        try{
            await addMember(userAddress)
            setMemberName(groupAddress, userAddress, name)
            await getMembers();
            await getBalances();
            handleAMDialogClose();

        }catch (err) {
            console.log(err, "Failed to add member")
        }
    }
    

    // Total spent: sum all expense amounts
    const totalSpent = useMemo(() => {
        if (!expenses || expenses.length === 0) return {totalEur: "0,00", totalEth: "0"};

        const totalCents = expenses.reduce((sum, exp) => sum + exp.amount, 0n);
        const totalEur = (Number(totalCents)/ 100).toFixed(2)

        let totalEth = "0";
        if (weiPerCent && weiPerCent !== 0n) {
            totalEth = parseFloat(ethers.formatEther(weiPerCent * totalCents)).toFixed(4);
        }

        return {totalEur, totalEth}
    }, [expenses, weiPerCent]);

    // Find current user's balance (returns number in cents)
    const userBalanceCents = useMemo(() => {
        if (!balances || !account) return null;
        const found = balances.find(
            b => b.address.toLowerCase() === account.toLowerCase()
        );
        return found ? Number(found.balance) : 0;
    }, [balances, account]);

    // Format for display
    const balanceEur = userBalanceCents !== null
        ? (Math.abs(userBalanceCents) / 100).toFixed(2)
        : "0.00";

    const balanceEth = (userBalanceCents !== null && weiPerCent)
        ? parseFloat(ethers.formatEther(weiPerCent * BigInt(Math.abs(userBalanceCents)))).toFixed(4)
        : "0";  


    return (
        <div className="GOWrapper">

            <div className="GOContainer">

                <div className="GOHeaderWrapper">
                    
                    <div className="GOHeaderContainer">
                        <h3 className="DashHeader">{groupName}</h3>
                        <img className="addAccountIcon" src={addAccountIcon} alt="addAccountIcon.png" onClick={handleAMDialogOpen}></img>
                    </div>

                    <div className="BBMemberInfoContainer">
                        <p>{members.length} {members.length === 1 ? "member" : "members"}</p>
                    </div>

                </div>


                <div className="GOBalanceContainer">

                    <div className="GOBalance">
                        <p>Total spent: </p>
                        
                        <div className="EURValue">
                            <p className="GOBalanceValue">{totalSpent.totalEur}</p>
                            <p>EUR</p>
                        </div>
                        <p className="ETHValue">( {totalSpent.totalEth}  ETH )</p>
                        
                    </div>

                    <div className="GOBalance">
                        {userBalanceCents !== null && (
                            userBalanceCents < 0
                                ? (
                                <>
                                    <p>You owe: </p>
                                    <div className="EURValueNegative">
                                        <p className="GOBalanceNegativeValue">{balanceEur}</p>
                                        <p>EUR</p>                                        
                                    </div>

                                </>
                                ) : (
                                <>
                                    <p>You are owed: </p>
                                    <div className="EURValuePositive">
                                        <p className="GOBalancePositiveValue">{balanceEur}</p>
                                        <p className="GOBalanceCurrPositive">EUR</p>                                        
                                    </div>
                                </>
                                )
                        )}
                        
                        <p className="ETHValue">( {balanceEth}  ETH )</p>

                    </div>
                </div>

            </div>

            {openAMDialog && (
                <dialog open className="addMembersDialog">
                    <AddMembersDialog 
                    handleAMDialogClose={handleAMDialogClose}
                    addMemberToGroup={addMemberToGroup}
                    selectedGroupAddress={selectedGroupAddress}      
                    >
                    </AddMembersDialog>
                </dialog>
            )}
        </div>
    )
}

export default GroupOverview;