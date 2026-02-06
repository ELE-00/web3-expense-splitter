//AddExpenseDialog.jsx
import React, {useState} from 'react';
import '../styles/expenseList.css'


const AddExpenseDialog = ({handleAddExpense, handleDialogClose}) => {


const [expenseItem, setExpenseItem] = useState("")
const [value, setValue] = useState("")

    return (

        <div className="AMDialogWrapper">

            <div className="AMFormContainer">
                <p>Add expense</p>
                <form className="AMForm">
                    <input
                        type="text"
                        placeholder="Expense"
                        name="expenseItem"
                        value={expenseItem}
                        onChange={(e) => setExpenseItem(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        name="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </form>
            </div>


        <div className="AMFooterBtn">
            <button className="dialogCreateBtn" onClick={() => handleAddExpense(value, expenseItem)}>Add</button>
            <button className="dialogCloseBtn" onClick={() => handleDialogClose()}>Close</button>
        </div>


        </div>
    )
}




export default AddExpenseDialog;