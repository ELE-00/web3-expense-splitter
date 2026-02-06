// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract ExpenseSplitter {

  //1. State

    event MemberAdded(address _address);
    event MemberRemoved(address _address);
    event ExpenseAdded(uint indexed expenseId, address indexed payer, uint amount, string description);
    event DebtSettled(address indexed debtor, address indexed creditor, uint256 eurCents, uint256 weiPaid);


    string public name;
    address public owner; //adress of user calling contract
    address[] public members; //addresses of memebers in group

    mapping(address => bool) public isMember;
    mapping(address => int256) public balances;

    // Chainlink Price Feeds
    AggregatorV3Interface internal ethUsdPriceFeed;
    AggregatorV3Interface internal eurUsdPriceFeed;

    struct Expense {
      address payer;
      uint amount;
      string description;
    }


    Expense[] public expense; //expense array 


  //2. Constructor
    constructor(
        string memory _name,
        address _owner,
        address _ethUsdPriceFeed,
        address _eurUsdPriceFeed
    ) {
        owner = _owner;
        members.push(_owner);
        isMember[_owner] = true;
        name = _name;

        // Initialize Chainlink Price Feeds
        // Sepolia: ETH/USD = 0x694AA1769357215DE4FAC081bf1f309aDC325306
        // Sepolia: EUR/USD = 0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
        eurUsdPriceFeed = AggregatorV3Interface(_eurUsdPriceFeed);
    }

  //3. Modifiers
    modifier onlyOwner() {
      require(msg.sender == owner, "must be owner");
      _;
    }


  //4. Functions

    //Add expense. Allowed only by members.
    function addExpense(uint _amount, string memory _description) public {
        require(isMember[msg.sender], "Only members can perform this action");

        expense.push(
            Expense({
                payer: msg.sender,
                amount: _amount,
                description: _description
            })
        );

        uint share = _amount / members.length;

        for(uint i = 0; i < members.length; i++) {
          address member = members[i];

          if(member == msg.sender) {
            balances[member] += int256(_amount - share); 
          } else {
            balances[member] -= int256(share);
          }
        }

        uint expenseId = expense.length - 1;
        emit ExpenseAdded(expenseId, msg.sender, _amount, _description);
    }

    //Add members
    function addMember(address _memberAdress) public onlyOwner {
      members.push(_memberAdress);
      isMember[_memberAdress] = true;

      emit MemberAdded(_memberAdress);
    }

    //Remove members
    function removeMember(uint _memberId) public onlyOwner {

      //Update mappoing
      address removedAddress = members[_memberId];
      isMember[removedAddress] = false;

      //Overrrite the element with the last element in the array     
      members[_memberId] = members[members.length - 1];
      //Remove last item
      members.pop();

      emit MemberRemoved(removedAddress);

    }


    //Remove self
      function removeSelf(uint _memberId) public {
        
      //Check if memberId is self
      require(members[_memberId] == msg.sender, "Can only remove yourself");

      //Update mappoing
      address removedAddress = members[_memberId];
      isMember[removedAddress] = false;

      //Overrrite the element with the last element in the array
      members[_memberId] = members[members.length - 1];
      //Remove last item
      members.pop();


      emit MemberRemoved(removedAddress);
    }


    //Get member array
    function getMembers() public view returns(address[] memory) {
      return members;
    }

    //Get expenses array
    function getExpenses() public view returns(Expense[] memory) {
      return expense;
    }

    //Get balance array
    function getBalance(address user) public view returns(int256) {
      return balances[user];
    }

    function getAllBalances()
        public
        view
        returns (address[] memory, int256[] memory)
    {
        int256[] memory memberBalances = new int256[](members.length);

        for (uint i = 0; i < members.length; i++) {
            memberBalances[i] = balances[members[i]];
        }

        return (members, memberBalances);
    }


  //5. Chainlink Price Feed Functions

    // Get ETH/USD price (8 decimals)
    function getEthUsdPrice() public view returns (int256) {
        (, int256 price,,,) = ethUsdPriceFeed.latestRoundData();
        return price; // e.g., 250000000000 = $2500.00
    }

    // Get EUR/USD price (8 decimals)
    function getEurUsdPrice() public view returns (int256) {
        (, int256 price,,,) = eurUsdPriceFeed.latestRoundData();
        return price; // e.g., 108000000 = $1.08
    }

    // Convert EUR cents to ETH wei
    // Formula: eurCents * eurUsdPrice / ethUsdPrice * 1e18 / 100
    function convertCentsToWei(uint256 eurCents) public view returns (uint256) {
        int256 ethUsdPrice = getEthUsdPrice();
        int256 eurUsdPrice = getEurUsdPrice();

        require(ethUsdPrice > 0, "Invalid ETH price");
        require(eurUsdPrice > 0, "Invalid EUR price");

        // eurCents * eurUsdPrice gives us USD value (with 8 decimals)
        // Divide by ethUsdPrice to get ETH value
        // Multiply by 1e18 to convert to wei
        // Divide by 100 to convert cents to EUR
        uint256 weiAmount = (eurCents * uint256(eurUsdPrice) * 1e18) / (uint256(ethUsdPrice) * 100);

        return weiAmount;
    }

    // Get current conversion rate: how many wei per 1 EUR cent
    function getWeiPerCent() public view returns (uint256) {
        return convertCentsToWei(1);
    }

    // Settle your debt with a creditor by paying ETH
    // Debtor sends ETH, creditor receives it, balances are updated
    function settleDebtWithEth(address creditor) public payable {
        require(isMember[msg.sender], "Only members can perform this action");
        require(isMember[creditor], "Creditor must be a member");
        require(balances[msg.sender] < 0, "You have no debt");
        require(balances[creditor] > 0, "Creditor has no credit");

        // Calculate how many EUR cents the sent ETH covers
        uint256 weiPerCent = getWeiPerCent();
        require(weiPerCent > 0, "Invalid conversion rate");

        uint256 centsPaid = msg.value / weiPerCent;
        require(centsPaid > 0, "Payment too small");

        // Cap the payment to the debtor's actual debt
        uint256 debtInCents = uint256(-balances[msg.sender]);
        if (centsPaid > debtInCents) {
            centsPaid = debtInCents;
        }

        // Cap the payment to the creditor's actual credit
        uint256 creditInCents = uint256(balances[creditor]);
        if (centsPaid > creditInCents) {
            centsPaid = creditInCents;
        }

        // Update balances
        balances[msg.sender] += int256(centsPaid);
        balances[creditor] -= int256(centsPaid);

        // Transfer ETH to creditor
        uint256 weiToTransfer = centsPaid * weiPerCent;
        payable(creditor).transfer(weiToTransfer);

        // Refund excess ETH to sender
        uint256 refund = msg.value - weiToTransfer;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }

        emit DebtSettled(msg.sender, creditor, centsPaid, weiToTransfer);
    }
}



