import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/parseError";

const SettleCard = ({settlementInfo, settleDebtWithEth}) => {

    const { showToast } = useToast();
    const [paying, setPaying] = useState(false);

    async function handlePay() {
        try {
            setPaying(true);
            await settleDebtWithEth(settlementInfo.toAddress, settlementInfo.weiAmount);
        } catch (err) { showToast(parseError(err)); } finally {
            setPaying(false);
        }
    }

    return (
        <div className="SCWrapper">

            <div className="SCLeftSection">
                <p>{settlementInfo.creditorName}</p>
            </div>

            <div className="SCMidSection">
                <p className="negativeValue">{settlementInfo.amountEur} EUR</p>
                <p className="ETHValue">{settlementInfo.balanceEth} ETH</p>
            </div>

            <div className="SCRightSection">
                <button className="payBtn" onClick={handlePay} disabled={paying}>
                    {paying ? "Paying..." : "Pay"}
                </button>
            </div>

        </div>
    )
}

export default SettleCard;