//ExpenseList.jsx
import { useState } from "react";
import '../styles/expenseList.css'
import addBtnIcon from "../assets/addBtn.png";
import { ethers } from "ethers";


import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/parseError";
import AddExpenseDialog from "./AddExpenseDialog";

const ExpenseList = ({expenses, addExpense, weiPerCent, submitting}) => {

    const { showToast } = useToast();
    const [openDialog, setOpenDialog] = useState(false);

    const handleDialogOpen = () => {
        setOpenDialog(true);
    }

    const handleDialogClose = () => {
        setOpenDialog(false);
    }


    async function handleAddExpense(value, description) {
        try{
            const valueCents = Math.round(value * 100);
            await addExpense(valueCents, description);
            handleDialogClose();
        }catch (err) { showToast(parseError(err)); }
    }



    return (
        <div className="ELWrapper"> 

            <div className="ELHeaderContainer">
                <h3 className="DashHeader"> Expense list </h3> 
                <img className="icons" src={addBtnIcon} alt="addBtn.png" onClick={submitting ? undefined : handleDialogOpen} style={submitting ? {opacity: 0.4, cursor: 'not-allowed'} : {}}></img>
            </div>

            <div className="ELContentContainer">
                {expenses.map((item, i) => {
                    const amountEur = (Number(item.amount) / 100).toFixed(2);

                    const balanceEth = (item.amount !== null && weiPerCent)
                        ? parseFloat(ethers.formatEther(weiPerCent * BigInt(Math.abs(Number(item.amount))))).toFixed(4)
                        : "0"; 

                    return(
                        <div className="userContainer">

                            <div >    
                                <p key={i}> {item.description} </p>  
                            </div>

                            <div className="detailsInfo">
                                <p key={item}> {amountEur} EUR</p>  
                                <p className="ETHValue"> ( {balanceEth} ETH )</p>
                            </div>

                        </div>
                    );          
                })}
            </div>






        {openDialog && (
            <dialog open className="addMembersDialog">
                <AddExpenseDialog
                handleAddExpense={handleAddExpense}
                handleDialogClose={handleDialogClose}
                submitting={submitting}
                >
                </AddExpenseDialog>
            </dialog>
        )}

        </div>

    )
}

export default ExpenseList;