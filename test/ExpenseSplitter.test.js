import { expect } from "chai";
import hre from "hardhat";

describe("ExpenseSplitter", function () {
  // We'll declare variables here that we'll use across tests
  let expenseSplitter;
  let owner;
  let member1;
  let member2;
  let nonMember;

  // This runs before each test - gives us a fresh contract every time
  beforeEach(async function () {
    // Get test accounts from Hardhat
    // Think of these as fake wallets for testing
    [owner, member1, member2, nonMember] = await hre.ethers.getSigners();

    // Deploy a fresh contract before each test
    const ExpenseSplitter = await hre.ethers.getContractFactory("ExpenseSplitter");
    expenseSplitter = await ExpenseSplitter.deploy();
    await expenseSplitter.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      // The owner() function is automatically created for public variables
      expect(await expenseSplitter.owner()).to.equal(owner.address);
    });

    it("Should add owner as first member", async function () {
      // Check the members array at index 0
      expect(await expenseSplitter.members(0)).to.equal(owner.address);
    });

    it("Should mark owner as a member in the mapping", async function () {
      // Check the isMember mapping
      expect(await expenseSplitter.isMember(owner.address)).to.equal(true);
    });
  });

  describe("addMember", function () {
    it("Should allow owner to add a new member", async function () {
      // Owner calls addMember
      await expenseSplitter.addMember(member1.address);

      // Verify member1 is now in the members array at index 1
      // (index 0 is the owner)
      expect(await expenseSplitter.members(1)).to.equal(member1.address);

      // Verify member1 is marked as a member in the mapping
      expect(await expenseSplitter.isMember(member1.address)).to.equal(true);
    });

    it("Should emit MemberAdded event", async function () {
      // Testing events is different - we use expect().to.emit()
      await expect(expenseSplitter.addMember(member1.address))
        .to.emit(expenseSplitter, "MemberAdded")
        .withArgs(member1.address);
    });

    it("Should reject when non-owner tries to add a member", async function () {
      // .connect(member1) makes the call come from member1's account
      // This should fail because only owner can add members
      await expect(
        expenseSplitter.connect(member1).addMember(member2.address)
      ).to.be.revertedWith("must be owner");
    });
  });

  describe("addExpense", function () {
    it("Should allow a member to add an expense", async function () {
      // Setup: Add member1 to the group
      await expenseSplitter.addMember(member1.address);

      // Act: member1 adds an expense
      const amount = 100;
      const description = "Pizza for the team";
      await expenseSplitter.connect(member1).addExpense(amount, description);

      // Assert: Check the expense was stored correctly
      // expense is a public array, so we can read it like expense(index)
      const expense = await expenseSplitter.expense(0);

      expect(expense.payer).to.equal(member1.address);
      expect(expense.amount).to.equal(amount);
      expect(expense.description).to.equal(description);
      expect(expense.settled).to.equal(false);
    });

    it("Should emit ExpenseAdded event with correct data", async function () {
      await expenseSplitter.addMember(member1.address);

      const amount = 100;
      const description = "Pizza for the team";

      // The event should emit: expenseId (0 for first expense), payer, amount, description
      await expect(
        expenseSplitter.connect(member1).addExpense(amount, description)
      )
        .to.emit(expenseSplitter, "ExpenseAdded")
        .withArgs(0, member1.address, amount, description);
    });

    it("Should reject when non-member tries to add an expense", async function () {
      // nonMember hasn't been added to the group
      // This should fail with "Only members can perform this action"
      await expect(
        expenseSplitter.connect(nonMember).addExpense(100, "Sneaky expense")
      ).to.be.revertedWith("Only members can perform this action");
    });

    it("Should allow multiple expenses and track them correctly", async function () {
      // Setup: Add member1
      await expenseSplitter.addMember(member1.address);

      // Add first expense
      await expenseSplitter.connect(member1).addExpense(50, "Lunch");

      // Add second expense by owner
      await expenseSplitter.connect(owner).addExpense(75, "Dinner");

      // Check both expenses exist
      const expense0 = await expenseSplitter.expense(0);
      const expense1 = await expenseSplitter.expense(1);

      expect(expense0.amount).to.equal(50);
      expect(expense0.description).to.equal("Lunch");

      expect(expense1.amount).to.equal(75);
      expect(expense1.description).to.equal("Dinner");
    });
  });

  describe("settleExpense", function () {
    beforeEach(async function () {
      // Common setup: Add member1 and create an expense
      await expenseSplitter.addMember(member1.address);
      await expenseSplitter.connect(member1).addExpense(100, "Team lunch");
    });

    it("Should allow a member to settle an expense", async function () {
      // Before settling, check it's not settled
      let expense = await expenseSplitter.expense(0);
      expect(expense.settled).to.equal(false);

      // Settle the expense
      await expenseSplitter.connect(owner).settleExpense(0);

      // After settling, check it IS settled
      expense = await expenseSplitter.expense(0);
      expect(expense.settled).to.equal(true);
    });

    it("Should emit ExpenseSettled event", async function () {
      await expect(expenseSplitter.connect(member1).settleExpense(0))
        .to.emit(expenseSplitter, "ExpenseSettled")
        .withArgs(0);
    });

    it("Should reject when non-member tries to settle", async function () {
      await expect(
        expenseSplitter.connect(nonMember).settleExpense(0)
      ).to.be.revertedWith("Only members can perform this action");
    });

    it("Should prevent settling an already settled expense", async function () {
      // First settle
      await expenseSplitter.connect(owner).settleExpense(0);

      // Verify it's settled
      let expense = await expenseSplitter.expense(0);
      expect(expense.settled).to.equal(true);

      // Try to settle again - should succeed but do nothing (early return)
      // The key test: should NOT emit an event the second time
      await expect(
        expenseSplitter.connect(member1).settleExpense(0)
      ).to.not.emit(expenseSplitter, "ExpenseSettled");

      // Still settled
      expense = await expenseSplitter.expense(0);
      expect(expense.settled).to.equal(true);
    });
  });

  describe("removeMember", function () {
    beforeEach(async function () {
      // Setup: Add two members so we have owner at [0], member1 at [1], member2 at [2]
      await expenseSplitter.addMember(member1.address);
      await expenseSplitter.addMember(member2.address);
    });

    it("Should allow owner to remove a member", async function () {
      // Remove member1 (at index 1)
      await expenseSplitter.removeMember(1);

      // Check that member1 is no longer marked as a member
      expect(await expenseSplitter.isMember(member1.address)).to.equal(false);

      // After removal using swap-and-pop:
      // Index 1 should now contain member2 (the last element was moved there)
      expect(await expenseSplitter.members(1)).to.equal(member2.address);
    });

    it("Should emit MemberRemoved event", async function () {
      await expect(expenseSplitter.removeMember(1))
        .to.emit(expenseSplitter, "MemberRemoved")
        .withArgs(member1.address);
    });

    it("Should reject when non-owner tries to remove a member", async function () {
      await expect(
        expenseSplitter.connect(member1).removeMember(1)
      ).to.be.revertedWith("must be owner");
    });

    it("Should handle removing the last member in the array", async function () {
      // Remove member2 (at index 2, the last one)
      await expenseSplitter.removeMember(2);

      // member2 should no longer be a member
      expect(await expenseSplitter.isMember(member2.address)).to.equal(false);

      // member1 should still be at index 1
      expect(await expenseSplitter.members(1)).to.equal(member1.address);
    });
  });

  describe("removeSelf", function () {
    beforeEach(async function () {
      // Setup: Add member1
      await expenseSplitter.addMember(member1.address);
    });

    it("Should allow a member to remove themselves", async function () {
      // member1 is at index 1
      await expenseSplitter.connect(member1).removeSelf(1);

      // member1 should no longer be a member
      expect(await expenseSplitter.isMember(member1.address)).to.equal(false);
    });

    it("Should emit MemberRemoved event", async function () {
      await expect(expenseSplitter.connect(member1).removeSelf(1))
        .to.emit(expenseSplitter, "MemberRemoved")
        .withArgs(member1.address);
    });

    it("Should reject if trying to remove someone else", async function () {
      // owner is at index 0, but member1 tries to remove them
      await expect(
        expenseSplitter.connect(member1).removeSelf(0)
      ).to.be.revertedWith("Can only remove yourself");
    });

    it("Should reject if the index doesn't match the caller", async function () {
      // member1 is at index 1, but tries to use index 0
      await expect(
        expenseSplitter.connect(member1).removeSelf(0)
      ).to.be.revertedWith("Can only remove yourself");
    });
  });
});
