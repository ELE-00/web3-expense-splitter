// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ExpenseSplitter {

  //1. State

    event MemberAdded(address _address);
    event MemberRemoved(address _address);
    event ExpenseAdded(uint indexed expenseId, address indexed payer, uint amount, string description);
    event ExpenseSettled(uint indexed expenseId);


    address public owner; //adress of user calling contract
    address[] public members; //addresses of memebers in group

    mapping(address => bool) public isMember;
    mapping(address => int256) public balances;

    struct Expense {
      address payer;
      uint amount;
      string description;
      bool settled;
    }


    Expense[] public expense; //expense array 


  //2. Constructor
    constructor() {
        owner = msg.sender;
        members.push(msg.sender);
        isMember[msg.sender] = true;
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
                description: _description,
                settled: false
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

  //Settle the expense. Allowed only by members.
    function settleExpense(uint expenseId) public {
        require(isMember[msg.sender], "Only members can perform this action");

        Expense storage exp = expense[expenseId];

        if(exp.settled == true) {
          return;
        }else {
          exp.settled = true;
        }

        emit ExpenseSettled(expenseId);
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
}



