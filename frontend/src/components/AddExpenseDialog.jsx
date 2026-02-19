//AddExpenseDialog.jsx
import { useState } from 'react';
import '../styles/expenseList.css'


const AddExpenseDialog = ({handleAddExpense, handleDialogClose, submitting}) => {


const [expenseItem, setExpenseItem] = useState("")
const [value, setValue] = useState("")

    return (

        <div className="AEDialogWrapper">

            <div className="AEFormContainer">
                <p>Add expense</p>
                <form className="AEForm">
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


        <div className="AEFooterBtn">
            <button className="dialogCreateBtn" onClick={() => handleAddExpense(value, expenseItem)} disabled={submitting}>{submitting ? "Adding..." : "Add"}</button>
            <button className="dialogCloseBtn" onClick={() => handleDialogClose()} disabled={submitting}>Close</button>
        </div>


        </div>
    )
}




export default AddExpenseDialog;