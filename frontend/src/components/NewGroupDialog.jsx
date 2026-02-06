//NewGroupDialog.jsx
import React, {useState} from 'react';
import '../styles/newGroupDialog.css'


const NewGroupDialog = ({handleDialogClose, handleCreateGroup}) => {

    const [groupName, setGroupName] = useState("")
    const [displayName, setDisplayName] = useState("")

    return (

        <div className="newGroupDialogWrapper">

            <div className="NGFormContainer">
                <form className="NGForm">
                    <input
                        type="text"
                        placeholder="Trip to Milan..."
                        name="name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Your name..."
                        name="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </form>
            </div>


        <div className="NGFooterBtn">
            <button className="dialogCreateBtn" onClick={() => handleCreateGroup(groupName, displayName)}>Create</button>
            <button className="dialogCloseBtn" onClick={() => handleDialogClose()}>Close</button>
        </div>


        </div>
    )
}

export default NewGroupDialog;