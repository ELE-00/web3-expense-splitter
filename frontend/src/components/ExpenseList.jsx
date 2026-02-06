//ExpenseList.jsx
import React, { useState } from "react";
import '../styles/expenseList.css'
import addBtnIcon from "../assets/addBtn.png";
import { ethers } from "ethers";


import AddExpenseDialog from "./AddExpenseDialog";

const ExpenseList = ({expenses, addExpense, weiPerCent}) => {

    console.log(expenses)

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
        }catch(err) {
            console.log(err, "Failed to add expense")
        }
    }



    return (
        <div className="ELWrapper"> 

            <div className="ELHeaderContainer">
                <h3 className="DashHeader"> Expense list </h3> 
                <img className="addAccountIcon" src={addBtnIcon} alt="addBtn.png" onClick={handleDialogOpen}></img>
            </div>

            <div className="ELContentContainer">
                {expenses.map((item, i) => {
                    const amountEur = (Number(item.amount) / 100).toFixed(2);

                    const balanceEth = (item.amount !== null && weiPerCent)
                        ? parseFloat(ethers.formatEther(weiPerCent * BigInt(Math.abs(item.amount)))).toFixed(4)
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
                >
                </AddExpenseDialog>
            </dialog>
        )}

        </div>

    )
}

export default ExpenseList;