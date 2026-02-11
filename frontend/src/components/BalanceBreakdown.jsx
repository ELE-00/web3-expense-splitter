//BalanceBreakdown.jsx
import React, { useState } from "react";
import '../styles/balanceBreakdown.css'
import { getGroupMembers} from "../utils/groupMembers";
import deleteBtn from "../assets/deleteBtn.png";

import SettleBalanceDialog from "./SettleBalanceDialog";
import { ethers } from "ethers";

const BalanceBreakdown = ({
    balances, 
    selectedGroupAddress, 
    account,  
    weiPerCent,
    settleDebtWithEth,
    removeMember,
    removeSelf,
    getMembers,
    getBalances,
} ) => {


    const [openSBDialog, setSBOpenDialog] = useState(false);

    const memberNames = getGroupMembers(selectedGroupAddress);


    const handleSBDialogOpen = () => {
        setSBOpenDialog(true);
    }

    const handleSBDialogClose = () => {
        setSBOpenDialog(false);
    }



      //handle removing members
    async function removeMemberFromGroup(userId, memberAddress) {
        try {
            // Check if removing self or another member
            if (memberAddress.toLowerCase() === account.toLowerCase()) {
                await removeSelf(userId);
            } else {
                await removeMember(userId);
            }
            await getMembers();
            await getBalances();
        } catch (err) {
            console.log(err, "Failed to remove member")
        }
    }


    return (
        <div className="BBWrapper"> 
        
            <div className="BBHeaderContainer">
                <h3 className="DashHeader"> Balances </h3> 
                <button onClick={() => handleSBDialogOpen()}>Pay</button>
            </div>

            <div className="BBContentContainer">
                {balances.map((item, i) => {

                    const name = memberNames[item.address] || item.address.slice(0,8) + "...";
                    const amountEur = (Number(item.balance) / 100).toFixed(2);

                    const balanceEth = (item.balance !== null && weiPerCent)
                        ? parseFloat(ethers.formatEther(weiPerCent * BigInt(Math.abs(item.balance)))).toFixed(4)
                        : "0"; 

                    return(
                        <div className="userContainer">

                            <div >    
                                <p key={i}> {name} </p>  
                            </div>

                            <div className="detailsInfo">

                                {amountEur > 0 
                                ? <p className="positiveValue" key={item}> {amountEur} EUR</p>
                                : <p className="negativeValue" key={item}> {amountEur} EUR</p>
                                }

                                <p className="ETHValue"> ( {balanceEth} ETH )</p>

                                <img className="deleteBtnIcon" src={deleteBtn} alt="deleteBtn.png" onClick={() => removeMemberFromGroup(i, item.address)}></img>
                            </div>

                        </div>
                    );          
                })}
            </div>


            {openSBDialog && (
                <dialog open className="settleBalanceDialog">
                    <SettleBalanceDialog
                    handleSBDialogClose={handleSBDialogClose}
                    account={account}
                    balances={balances}
                    memberNames={memberNames}
                    weiPerCent={weiPerCent}
                    settleDebtWithEth={settleDebtWithEth}
                    selectedGroupAddress={selectedGroupAddress}
                    >
                    </SettleBalanceDialog>
                </dialog>
            )}

        </div>
    )
}

export default BalanceBreakdown;