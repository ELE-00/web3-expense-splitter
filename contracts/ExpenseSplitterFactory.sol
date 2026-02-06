// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "./ExpenseSplitter.sol";

contract ExpenseSplitterFactory {

    //Events
    event ContractCreated(address _address);

    address public owner;

    // Chainlink Price Feed addresses (set once at deployment)
    address public ethUsdPriceFeed;
    address public eurUsdPriceFeed;

    struct groupContract {
        string name;
        address contractAddress;
    }

    groupContract[] public groups;


    //2. Constructor
        constructor(address _ethUsdPriceFeed, address _eurUsdPriceFeed) {
            owner = msg.sender;
            // Sepolia: ETH/USD = 0x694AA1769357215DE4FAC081bf1f309aDC325306
            // Sepolia: EUR/USD = 0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910
            ethUsdPriceFeed = _ethUsdPriceFeed;
            eurUsdPriceFeed = _eurUsdPriceFeed;
        }


    //3. Functions
    function createGroup(string memory _name) public {
        ExpenseSplitter newGroup = new ExpenseSplitter(
            _name,
            msg.sender,
            ethUsdPriceFeed,
            eurUsdPriceFeed
        );
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