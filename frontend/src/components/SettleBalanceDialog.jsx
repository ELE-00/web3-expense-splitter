//addMembersDialog.jsx
import React, {useMemo} from 'react';
import '../styles/balanceBreakdown.css'
import SettleCard from './SettleCard';
import { ethers } from "ethers";

const SettleBalanceDialog = ({account, balances, memberNames, weiPerCent, settleDebtWithEth, selectedGroupAddress, handleSBDialogClose}) => {


    const myAddress = account

    const settlementInfo = useMemo(() => {
        //Check my balance
        const me = balances.find(item => item.address.toLowerCase() === myAddress.toLowerCase())
        if(!me) return null

        //I am owed => no dialog
        if(me.balance >= 0) return {
            creditorName: "",
            toAdress: "",
            amountEur: 0,
            balanceEth: 0
        }

        //I owe => find someone who is owed     
        const creditor = balances.find(item => item.balance > 0 && item.address.toLowerCase() !== myAddress.toLowerCase())
        if(!creditor) return null        
        const creditorName = memberNames[creditor.address] || creditor.address.slice(0,8) + "...";


        //Values formatting
        const absCents = Math.abs(Number(me.balance));
        const amountEur = (absCents / 100).toFixed(2);

        const weiAmount = weiPerCent ? weiPerCent * BigInt(absCents) : 0n;
        const balanceEth = weiAmount > 0n
            ? parseFloat(ethers.formatEther(weiAmount)).toFixed(4)
            : "0";

        return {
            creditorName: creditorName,
            toAdress: creditor.address,
            amountEur: amountEur,
            balanceEth: balanceEth,
            weiAmount: weiAmount
        }
    }, [balances, myAddress, memberNames, weiPerCent])


    return (

        <div className="SBDialogWrapper">

            <div className="SBHeaderContainer">
               <p>Settle balance</p> 
            </div>

            <div className="SBContentContainer">

                {settlementInfo?.creditorName
                ? <SettleCard settlementInfo={settlementInfo} settleDebtWithEth={settleDebtWithEth}></SettleCard>
                : "Everything in check! You don't owe anything"
                }
                
            </div>


        <div className="SBFooterBtn">
            <button className="dialogCloseBtn" onClick={() => handleSBDialogClose()}>Close</button>
        </div>


        </div>
    )
}

export default SettleBalanceDialog;