import React, { useState, useEffect } from "react";
import '../styles/sidebar.css'
import { useExpenseSplitterFactory } from "../hooks/useExpenseSplitterFactory";
import { setMemberName, getGroupMembers } from "../utils/groupMembers";
import NewGroupDialog from "./NewGroupDialog";

const Sidebar = ({setSelectedGroupAddress, selectedGroupAddress, account, handleDisconnect}) => {

    const { groups, getGroups, createGroup } = useExpenseSplitterFactory();

    const [openDialog, setOpenDialog] = useState(false);

    // Get user's display name for the selected group
    const memberNames = selectedGroupAddress ? getGroupMembers(selectedGroupAddress) : {};
    const displayName = memberNames[account?.toLowerCase()] || null;
   

    useEffect(() => {

        const fetchGroups = async () => {
            await getGroups();            
        }
        fetchGroups();

    }, [getGroups])


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
        
            <div className="header"> 
                <h3> ExpenseSplittr </h3> 
            </div> 
            

            <div className="SBcontentContainer">

                <div className="SBTopSection">
                    <div className="GRPbtn">
                        <button onClick={handleDialogOpen}>Create Group</button>
                    </div>

                    <div className="groupList">
                    {groups.length == 0  
                        ? "Create a group to get started" 
                        : groups.map((group, i) => (
                            <p className="groupItem" onClick={setSelectedGroupAddress(group.contractAddress)} key={i}>{group.name}</p>
                        ))}

                    </div>
                </div>
                
                <div className="SBFooterSection">
                    <button className="Disconnectbtn" onClick={handleDisconnect}>
                        Disconnect Wallet
                    </button>
                    
                    <div className="SBFooterAccountInfo">
                        <p className="footerHeaderText">Connected Account:</p>
                        <p className="footerText">{displayName}</p>
                    </div>

                </div>

            </div>
            {openDialog && (
                <dialog open className="followDialog">
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