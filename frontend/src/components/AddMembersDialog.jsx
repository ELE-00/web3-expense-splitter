//addMembersDialog.jsx
import React, {useState} from 'react';
import '../styles/balanceBreakdown.css'


const AddMembersDialog = ({addMemberToGroup, selectedGroupAddress, handleAMDialogClose}) => {

    const [userName, setUserName] = useState("")
    const [userAddress, setUserAddress] = useState("")

    return (

        <div className="AMDialogWrapper">

            <div className="AMFormContainer">
                <p>Add member</p>
                <form className="AMForm">
                    <input
                        type="text"
                        placeholder="Name"
                        name="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="0xb9d878..."
                        name="userAddress"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                    />
                </form>
            </div>


        <div className="AMFooterBtn">
            <button className="dialogCreateBtn" onClick={() => addMemberToGroup(userName, userAddress, selectedGroupAddress)}>Add</button>
            <button className="dialogCloseBtn" onClick={() => handleAMDialogClose()}>Close</button>
        </div>


        </div>
    )
}

export default AddMembersDialog;