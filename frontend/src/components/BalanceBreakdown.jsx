//BalanceBreakdown.jsx
import React, { useState } from "react";
import '../styles/balanceBreakdown.css'
import { getGroupMembers, setMemberName} from "../utils/groupMembers";
import addAccountIcon from "../assets/addAccountIcon.png";
import deleteBtn from "../assets/deleteBtn.png";
import AddMembersDialog from "./AddMembersDialog";
import { ethers } from "ethers";

const BalanceBreakdown = ( {balances, selectedGroupAddress, account, addMember, getMembers, getBalances, removeMember, removeSelf, weiPerCent} ) => {

    const [openDialog, setOpenDialog] = useState(false);
    const memberNames = getGroupMembers(selectedGroupAddress);

    console.log(memberNames)

    const handleDialogOpen = () => {
        setOpenDialog(true);
    }

    const handleDialogClose = () => {
        setOpenDialog(false);
    }


      //handle adding members
    async function addMemberToGroup(name, userAddress, groupAddress) {
        try{
            await addMember(userAddress)
            setMemberName(groupAddress, userAddress, name)
            await getMembers();
            await getBalances();
            handleDialogClose();

        }catch (err) {
            console.log(err, "Failed to add member")
        }
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
                <img className="addAccountIcon" src={addAccountIcon} alt="addAccountIcon.png" onClick={handleDialogOpen}></img>
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


            {openDialog && (
                <dialog open className="addMembersDialog">
                    <AddMembersDialog 
                    handleDialogClose={handleDialogClose}
                    addMemberToGroup={addMemberToGroup}
                    selectedGroupAddress={selectedGroupAddress}      
                    >
                    </AddMembersDialog>
                </dialog>
            )}

        </div>
    )
}

export default BalanceBreakdown;