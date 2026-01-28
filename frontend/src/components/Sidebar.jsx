import React, { useState, useEffect } from "react";
import '../styles/sidebar.css'
import { useExpenseSplitterFactory } from "../hooks/useExpenseSplitterFactory";
import NewGroupDialog from "./NewGroupDialog";

const Sidebar = () => {

    const { groups, getGroups, createGroup } = useExpenseSplitterFactory();

    const [openDialog, setOpenDialog] = useState(false);


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

    async function handleCreateGroup(name) {
        await createGroup(name)    
    }

    return (
        <div className="SidebarContainer"> 
        
            <div className="header"> 
                <h3> ExpenseSplitter </h3> 
            </div> 
            
            <div className="GRPbtn">
                <button onClick={handleDialogOpen}>Create Group</button>
            </div>

            <div className="groupList">

                {groups.length == 0 
                ? "Create a group to get started" 
                : groups.map((group, i) => (
                    <p className="groupItem" key={i}>{group.name}</p>
                ))}

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