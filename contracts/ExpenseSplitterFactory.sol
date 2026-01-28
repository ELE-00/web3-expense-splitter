// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "./ExpenseSplitter.sol";

contract ExpenseSplitterFactory {

    //Events
    event ContractCreated(address _address);
    
    address public owner;

    struct groupContract {
        string name;
        address contractAddress;
    }

    groupContract[] public groups;


    //2. Constructor
        constructor() {
            owner = msg.sender;
        }


    //3. Functions
    function createGroup(string memory _name) public {
        ExpenseSplitter newGroup = new ExpenseSplitter(_name, msg.sender);
        address groupAddress = address(newGroup);

        groups.push(
            groupContract({
                name: _name,
                contractAddress: groupAddress
            })
        );

        emit ContractCreated(groupAddress);
    }


    function getGroups() public view returns(groupContract[] memory) {
        return groups;
    }


}