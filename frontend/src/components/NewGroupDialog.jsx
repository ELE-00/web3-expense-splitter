//NewGroupDialog.jsx
import React, {useState} from 'react';
import '../styles/newGroupDialog.css'


const NewGroupDialog = ({handleDialogClose, handleCreateGroup}) => {

    const [groupName, setGroupName] = useState("")


    const handleChange = async (e) => {
        setGroupName(e.target.value);
        handleDialogClose();
    }

    return (

        <div className="newGroupDialogWrapper">
            
            <div className="NGFormContainer">
                <form className="NGForm">
                    <input type="text" placeholder="Trip to Milan..." name="name" value={groupName} onChange={handleChange}></input>
                </form>
            </div>

            
        <div className="NGFooterBtn">
            <button  className="dialogCreateBtn" onClick={() => handleCreateGroup(groupName)}>Create</button>
            <button  className="dialogCloseBtn" onClick={() => handleDialogClose()}>Close</button>
        </div>
            
            
        </div>
    )
}

export default NewGroupDialog;