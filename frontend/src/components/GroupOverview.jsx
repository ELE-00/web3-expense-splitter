//GroupOverview.jsx
import { useMemo } from "react";
import { ethers } from "ethers";
import '../styles/groupOverview.css'

const GroupOverview = ({groupName, members, balances, expenses, account, weiPerCent}) => {

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


    console.log(totalSpent.totalEth)

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
                <h3 className="DashHeader">{groupName}</h3>
                <p>{members.length} {members.length === 1 ? "member" : "members"}</p>

                <div className="GOBalance">
                    <p>Total spent: {totalSpent.totalEur} EUR </p>
                    <p className="ETHValue">( {totalSpent.totalEth}  ETH )</p>
                </div>

                <div className="GOBalance">
                    {userBalanceCents !== null && (
                        userBalanceCents < 0
                            ? <p className="negativeValue">You owe: {balanceEur} EUR</p>
                            : <p className="positiveValue">You are owed: {balanceEur} EUR</p>
                    )}
                    <p className="ETHValue">( {balanceEth}  ETH )</p>

                </div>
            </div>
        </div>
    )
}

export default GroupOverview;