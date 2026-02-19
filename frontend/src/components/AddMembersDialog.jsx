//addMembersDialog.jsx
import { useState } from 'react';
import { ethers } from 'ethers';
import '../styles/groupOverview.css'


const AddMembersDialog = ({addMemberToGroup, selectedGroupAddress, handleAMDialogClose, submitting}) => {

    const [userName, setUserName] = useState("")
    const [userAddress, setUserAddress] = useState("")

    const addressError = userAddress.length > 0 && (
        !ethers.isAddress(userAddress)
            ? "Invalid Ethereum address"
            : userAddress.toLowerCase() === selectedGroupAddress?.toLowerCase()
                ? "Cannot add the group contract as a member"
                : null
    );

    const canSubmit = !submitting && userName.trim().length > 0 && ethers.isAddress(userAddress) && userAddress.toLowerCase() !== selectedGroupAddress?.toLowerCase();

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
                    {addressError && <p className="AMAddressError">{addressError}</p>}
                </form>
            </div>


        <div className="AMFooterBtn">
            <button className="dialogCreateBtn" onClick={() => addMemberToGroup(userName, userAddress, selectedGroupAddress)} disabled={!canSubmit}>{submitting ? "Adding..." : "Add"}</button>
            <button className="dialogCloseBtn" onClick={() => handleAMDialogClose()} disabled={submitting}>Close</button>
        </div>


        </div>
    )
}

export default AddMembersDialog;