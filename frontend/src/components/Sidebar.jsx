import { useState, useEffect } from "react";
import '../styles/sidebar.css'
import { useExpenseSplitterFactory } from "../hooks/useExpenseSplitterFactory";
import { setMemberName, getGroupMembers } from "../utils/groupMembers";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/parseError";
import editIcon from "../assets/editIcon.png";
import NewGroupDialog from "./NewGroupDialog";

const Sidebar = ({setSelectedGroupAddress, selectedGroupAddress, account, handleDisconnect, onClose}) => {

    const { groups, getGroups, createGroup, submitting, error } = useExpenseSplitterFactory();
    const { showToast } = useToast();

    const [openDialog, setOpenDialog] = useState(false);
    const [editing, setEditing] = useState(false);
    const [nameInput, setNameInput] = useState("");

    useEffect(() => {
        if (error) showToast(parseError(error));
    }, [error, showToast]);

    // Get user's display name for the selected group
    const memberNames = selectedGroupAddress ? getGroupMembers(selectedGroupAddress) : {};
    const displayName = memberNames[account?.toLowerCase()] || null;

    function handleEditStart() {
        setNameInput(displayName || "");
        setEditing(true);
    }

    function handleEditSave() {
        if (nameInput.trim() && selectedGroupAddress) {
            setMemberName(selectedGroupAddress, account, nameInput.trim());
        }
        setEditing(false);
    }

    function handleEditKeyDown(e) {
        if (e.key === "Enter") handleEditSave();
        if (e.key === "Escape") setEditing(false);
    }

    useEffect(() => {
        getGroups();
    }, [getGroups]);

    // Re-fetch groups when leaving a group (e.g. after removing self)
    useEffect(() => {
        if (selectedGroupAddress === null) {
            getGroups();
        }
    }, [selectedGroupAddress, getGroups]);


    const handleDialogOpen = () => {
        setOpenDialog(true);
    }

    const handleDialogClose = () => {
        setOpenDialog(false);
    }

    async function handleCreateGroup(name, displayName) {
        const newGroupAddress = await createGroup(name);
        if (newGroupAddress && displayName) {
            setMemberName(newGroupAddress, account, displayName);
        }
        handleDialogClose();
    }

    return (
        <div className="SidebarContainer">

            <div className="SBheader">
                <h3> ExpenseSplittr </h3>
                <button className="closeSidebarBtn" onClick={onClose}>✕</button>
            </div>
            

            <div className="SBcontentContainer">

                <div className="SBTopSection">
                    <div className="GRPbtn">
                        <button onClick={handleDialogOpen} disabled={submitting}>{submitting ? "Creating..." : "Create Group"}</button>
                    </div>

                    <div className="seperator"></div>

                    <div className="groupList">
                    <h4>Groups:</h4>
                    {groups.length == 0  
                        ? <p className="noGrpMessage">Create a group to get started</p> 
                        : groups.map((group, i) => (
                            <p className="groupItem" onClick={() => setSelectedGroupAddress(group.contractAddress)} key={i}>{group.name}</p>
                        ))}

                    </div>
                </div>
                
                <div className="SBFooterSection">
                    <button className="disconnectBtn" onClick={handleDisconnect}>
                        Disconnect Wallet
                    </button>
                    
                    <div className="SBFooterAccountInfo">
                        <p className="footerHeaderText">Connected Account:</p>
                        {editing ? (
                            <div className="nameEditRow">
                                <input
                                    className="nameEditInput"
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    autoFocus
                                    placeholder="Your name"
                                />
                                <button className="nameEditSaveBtn" onClick={handleEditSave}>Save</button>
                            </div>
                        ) : (
                            <div className="nameDisplayRow">
                                <p className="footerText">{displayName || account.slice(0,8) + "..."}</p>
                                {selectedGroupAddress && (
                                    <img className="editIcon" src={editIcon} alt="edit" onClick={handleEditStart} />
                                )}
                            </div>
                        )}
                    </div>

                </div>

            </div>
            {openDialog && (
                <dialog open className="newGroupDialog">
                    <NewGroupDialog 
                    handleCreateGroup={handleCreateGroup}
                    handleDialogClose={handleDialogClose}      
                    >
                    </NewGroupDialog>
                </dialog>
            )}
              
        
        </div>

    )
}

export default Sidebar;