import { expect } from "chai";
import hre from "hardhat";

describe("ExpenseSplitter", function () {
  let expenseSplitter;
  let mockEthUsd;
  let mockEurUsd;
  let owner;
  let member1;
  let member2;
  let nonMember;

  // ETH/USD = $2500 (8 decimals), EUR/USD = $1.08 (8 decimals)
  const ETH_USD_PRICE = 250000000000n;
  const EUR_USD_PRICE = 108000000n;

  beforeEach(async function () {
    [owner, member1, member2, nonMember] = await hre.ethers.getSigners();

    // Deploy mock price feeds
    const MockV3Aggregator = await hre.ethers.getContractFactory("MockV3Aggregator");
    mockEthUsd = await MockV3Aggregator.deploy(8, ETH_USD_PRICE);
    await mockEthUsd.deployed();
    mockEurUsd = await MockV3Aggregator.deploy(8, EUR_USD_PRICE);
    await mockEurUsd.deployed();

    // Deploy ExpenseSplitter with constructor params
    const ExpenseSplitter = await hre.ethers.getContractFactory("ExpenseSplitter");
    expenseSplitter = await ExpenseSplitter.deploy(
      "Test Group",
      owner.address,
      mockEthUsd.address,
      mockEurUsd.address
    );
    await expenseSplitter.deployed();
  });

  // ============================================================
  // DEPLOYMENT
  // ============================================================
  describe("Deployment", function () {
    it("Should set the group name", async function () {
      expect(await expenseSplitter.name()).to.equal("Test Group");
    });

    it("Should set the right owner", async function () {
      expect(await expenseSplitter.owner()).to.equal(owner.address);
    });

    it("Should add owner as first member", async function () {
      expect(await expenseSplitter.members(0)).to.equal(owner.address);
    });

    it("Should mark owner as a member", async function () {
      expect(await expenseSplitter.isMember(owner.address)).to.equal(true);
    });

    it("Should start with zero balance for owner", async function () {
      expect(await expenseSplitter.getBalance(owner.address)).to.equal(0);
    });
  });

  // ============================================================
  // MEMBER MANAGEMENT
  // ============================================================
  describe("addMember", function () {
    it("Should allow owner to add a new member", async function () {
      await expenseSplitter.addMember(member1.address);

      expect(await expenseSplitter.members(1)).to.equal(member1.address);
      expect(await expenseSplitter.isMember(member1.address)).to.equal(true);
    });

    it("Should emit MemberAdded event", async function () {
      await expect(expenseSplitter.addMember(member1.address))
        .to.emit(expenseSplitter, "MemberAdded")
        .withArgs(member1.address);
    });

    it("Should reject when non-owner tries to add a member", async function () {
      await expect(
        expenseSplitter.connect(member1).addMember(member2.address)
      ).to.be.revertedWith("must be owner");
    });

    it("Should return correct members array via getMembers", async function () {
      await expenseSplitter.addMember(member1.address);
      await expenseSplitter.addMember(member2.address);

      const members = await expenseSplitter.getMembers();
      expect(members.length).to.equal(3);
      expect(members[0]).to.equal(owner.address);
      expect(members[1]).to.equal(member1.address);
      expect(members[2]).to.equal(member2.address);
    });
  });

  describe("removeMember", function () {
    beforeEach(async function () {
      await expenseSplitter.addMember(member1.address);
      await expenseSplitter.addMember(member2.address);
      // members: [owner, member1, member2]
    });

    it("Should allow owner to remove a member", async function () {
      await expenseSplitter.removeMember(1); // remove member1
      expect(await expenseSplitter.isMember(member1.address)).to.equal(false);
    });

    it("Should swap-and-pop correctly (middle element)", async function () {
      await expenseSplitter.removeMember(1); // remove member1
      // member2 (last) moves to index 1
      expect(await expenseSplitter.members(1)).to.equal(member2.address);
      const members = await expenseSplitter.getMembers();
      expect(members.length).to.equal(2);
    });

    it("Should handle removing the last element", async function () {
      await expenseSplitter.removeMember(2); // remove member2 (last)
      expect(await expenseSplitter.isMember(member2.address)).to.equal(false);
      expect(await expenseSplitter.members(1)).to.equal(member1.address);
    });

    it("Should emit MemberRemoved event", async function () {
      await expect(expenseSplitter.removeMember(1))
        .to.emit(expenseSplitter, "MemberRemoved")
        .withArgs(member1.address);
    });

    it("Should reject when non-owner tries to remove", async function () {
      await expect(
        expenseSplitter.connect(member1).removeMember(1)
      ).to.be.revertedWith("must be owner");
    });
  });

  describe("removeSelf", function () {
    beforeEach(async function () {
      await expenseSplitter.addMember(member1.address);
      // members: [owner, member1]
    });

    it("Should allow a member to remove themselves", async function () {
      await expenseSplitter.connect(member1).removeSelf(1);
      expect(await expenseSplitter.isMember(member1.address)).to.equal(false);
    });

    it("Should emit MemberRemoved event", async function () {
      await expect(expenseSplitter.connect(member1).removeSelf(1))
        .to.emit(expenseSplitter, "MemberRemoved")
        .withArgs(member1.address);
    });

    it("Should reject if trying to remove someone else", async function () {
      await expect(
        expenseSplitter.connect(member1).removeSelf(0) // index 0 is owner
      ).to.be.revertedWith("Can only remove yourself");
    });
  });

  // ============================================================
  // EXPENSE TRACKING
  // ============================================================
  describe("addExpense", function () {
    beforeEach(async function () {
      await expenseSplitter.addMember(member1.address);
      // members: [owner, member1]
    });

    it("Should store an expense correctly", async function () {
      await expenseSplitter.connect(member1).addExpense(1000, "Dinner");

      const exp = await expenseSplitter.expense(0);
      expect(exp.payer).to.equal(member1.address);
      expect(exp.amount).to.equal(1000);
      expect(exp.description).to.equal("Dinner");
    });

    it("Should emit ExpenseAdded event", async function () {
      await expect(
        expenseSplitter.connect(member1).addExpense(1000, "Dinner")
      )
        .to.emit(expenseSplitter, "ExpenseAdded")
        .withArgs(0, member1.address, 1000, "Dinner");
    });

    it("Should reject when non-member adds expense", async function () {
      await expect(
        expenseSplitter.connect(nonMember).addExpense(500, "Sneaky")
      ).to.be.revertedWith("Only members can perform this action");
    });

    it("Should return all expenses via getExpenses", async function () {
      await expenseSplitter.connect(member1).addExpense(500, "Lunch");
      await expenseSplitter.connect(owner).addExpense(800, "Taxi");

      const expenses = await expenseSplitter.getExpenses();
      expect(expenses.length).to.equal(2);
      expect(expenses[0].description).to.equal("Lunch");
      expect(expenses[1].description).to.equal("Taxi");
    });

    it("Should increment expense IDs in events", async function () {
      await expect(expenseSplitter.addExpense(100, "First"))
        .to.emit(expenseSplitter, "ExpenseAdded")
        .withArgs(0, owner.address, 100, "First");

      await expect(expenseSplitter.addExpense(200, "Second"))
        .to.emit(expenseSplitter, "ExpenseAdded")
        .withArgs(1, owner.address, 200, "Second");
    });
  });

  // ============================================================
  // BALANCE CALCULATION
  // ============================================================
  describe("Balance calculation", function () {
    beforeEach(async function () {
      await expenseSplitter.addMember(member1.address);
      // members: [owner, member1] — 2 members
    });

    it("Should split evenly between 2 members", async function () {
      // member1 pays 1000 cents (€10.00), split = 500 each
      // member1: +1000 - 500 = +500 (owed)
      // owner:   -500 (owes)
      await expenseSplitter.connect(member1).addExpense(1000, "Dinner");

      expect(await expenseSplitter.getBalance(member1.address)).to.equal(500);
      expect(await expenseSplitter.getBalance(owner.address)).to.equal(-500);
    });

    it("Should accumulate across multiple expenses", async function () {
      // Expense 1: member1 pays 1000 → member1: +500, owner: -500
      await expenseSplitter.connect(member1).addExpense(1000, "Dinner");
      // Expense 2: owner pays 600 → owner: -500 + 300 = -200, member1: +500 - 300 = +200
      await expenseSplitter.addExpense(600, "Drinks");

      expect(await expenseSplitter.getBalance(member1.address)).to.equal(200);
      expect(await expenseSplitter.getBalance(owner.address)).to.equal(-200);
    });

    it("Should net to zero when same person pays equal amounts", async function () {
      await expenseSplitter.connect(member1).addExpense(1000, "Dinner");
      await expenseSplitter.addExpense(1000, "Lunch");

      expect(await expenseSplitter.getBalance(member1.address)).to.equal(0);
      expect(await expenseSplitter.getBalance(owner.address)).to.equal(0);
    });

    it("Should split correctly among 3 members", async function () {
      await expenseSplitter.addMember(member2.address);
      // members: [owner, member1, member2] — 3 members

      // owner pays 900 cents, share = 300 each
      // owner: +900 - 300 = +600
      // member1: -300
      // member2: -300
      await expenseSplitter.addExpense(900, "Group dinner");

      expect(await expenseSplitter.getBalance(owner.address)).to.equal(600);
      expect(await expenseSplitter.getBalance(member1.address)).to.equal(-300);
      expect(await expenseSplitter.getBalance(member2.address)).to.equal(-300);
    });

    it("Should handle integer division truncation", async function () {
      // 100 cents split among 3 members = 33 each (1 cent lost to truncation)
      await expenseSplitter.addMember(member2.address);
      await expenseSplitter.addExpense(100, "Coffee");

      // owner: +100 - 33 = +67
      // member1: -33
      // member2: -33
      expect(await expenseSplitter.getBalance(owner.address)).to.equal(67);
      expect(await expenseSplitter.getBalance(member1.address)).to.equal(-33);
      expect(await expenseSplitter.getBalance(member2.address)).to.equal(-33);
    });

    it("Should return all balances via getAllBalances", async function () {
      await expenseSplitter.connect(member1).addExpense(1000, "Dinner");

      const [addresses, bals] = await expenseSplitter.getAllBalances();
      expect(addresses.length).to.equal(2);
      expect(addresses[0]).to.equal(owner.address);
      expect(addresses[1]).to.equal(member1.address);
      expect(bals[0]).to.equal(-500);
      expect(bals[1]).to.equal(500);
    });
  });

  // ============================================================
  // CHAINLINK INTEGRATION
  // ============================================================
  describe("Chainlink price feeds", function () {
    it("Should return ETH/USD price from mock", async function () {
      expect(await expenseSplitter.getEthUsdPrice()).to.equal(ETH_USD_PRICE);
    });

    it("Should return EUR/USD price from mock", async function () {
      expect(await expenseSplitter.getEurUsdPrice()).to.equal(EUR_USD_PRICE);
    });

    it("Should convert cents to wei correctly", async function () {
      // 100 cents (€1.00):
      // (100 * 108000000 * 1e18) / (250000000000 * 100)
      // = 10800000000 * 1e18 / 25000000000000
      // = 432000000000000 wei
      const weiFor100Cents = await expenseSplitter.convertCentsToWei(100);
      const expected = (100n * EUR_USD_PRICE * BigInt(1e18)) / (ETH_USD_PRICE * 100n);
      expect(weiFor100Cents).to.equal(expected);
    });

    it("Should return weiPerCent as convertCentsToWei(1)", async function () {
      const weiPerCent = await expenseSplitter.getWeiPerCent();
      const weiFor1Cent = await expenseSplitter.convertCentsToWei(1);
      expect(weiPerCent).to.equal(weiFor1Cent);
    });

    it("Should scale linearly (100 cents = 100 * weiPerCent)", async function () {
      const weiPerCent = await expenseSplitter.getWeiPerCent();
      const weiFor100 = await expenseSplitter.convertCentsToWei(100);
      // May differ slightly due to integer division, but should be close
      expect(weiFor100).to.be.closeTo(weiPerCent.mul(100), weiPerCent);
    });

    it("Should revert if ETH price is zero", async function () {
      await mockEthUsd.updateAnswer(0);
      await expect(expenseSplitter.convertCentsToWei(100))
        .to.be.revertedWith("Invalid ETH price");
    });

    it("Should revert if EUR price is zero", async function () {
      await mockEurUsd.updateAnswer(0);
      await expect(expenseSplitter.convertCentsToWei(100))
        .to.be.revertedWith("Invalid EUR price");
    });
  });

  // ============================================================
  // SETTLE DEBT WITH ETH
  // ============================================================
  describe("settleDebtWithEth", function () {
    let weiPerCent;

    beforeEach(async function () {
      await expenseSplitter.addMember(member1.address);
      // members: [owner, member1]

      // member1 pays 1000 cents → member1: +500, owner: -500
      await expenseSplitter.connect(member1).addExpense(1000, "Dinner");

      weiPerCent = await expenseSplitter.getWeiPerCent();
    });

    it("Should settle debt and update balances", async function () {
      const paymentWei = weiPerCent.mul(500);

      await expenseSplitter.settleDebtWithEth(member1.address, {
        value: paymentWei,
      });

      expect(await expenseSplitter.getBalance(owner.address)).to.equal(0);
      expect(await expenseSplitter.getBalance(member1.address)).to.equal(0);
    });

    it("Should transfer ETH to creditor", async function () {
      const paymentWei = weiPerCent.mul(500);
      const creditorBalanceBefore = await hre.ethers.provider.getBalance(member1.address);

      await expenseSplitter.settleDebtWithEth(member1.address, {
        value: paymentWei,
      });

      const creditorBalanceAfter = await hre.ethers.provider.getBalance(member1.address);
      expect(creditorBalanceAfter.sub(creditorBalanceBefore)).to.equal(paymentWei);
    });

    it("Should emit DebtSettled event", async function () {
      const paymentWei = weiPerCent.mul(500);

      await expect(
        expenseSplitter.settleDebtWithEth(member1.address, { value: paymentWei })
      )
        .to.emit(expenseSplitter, "DebtSettled")
        .withArgs(owner.address, member1.address, 500, paymentWei);
    });

    it("Should cap payment to debtor's actual debt", async function () {
      // Overpay: send enough for 1000 cents, but debt is only 500
      const overpayWei = weiPerCent.mul(1000);
      const ownerBalanceBefore = await hre.ethers.provider.getBalance(owner.address);

      const tx = await expenseSplitter.settleDebtWithEth(member1.address, {
        value: overpayWei,
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      // Balance should be fully settled (capped at 500 cents)
      expect(await expenseSplitter.getBalance(owner.address)).to.equal(0);

      // Owner should get refund of excess ETH (minus gas)
      const ownerBalanceAfter = await hre.ethers.provider.getBalance(owner.address);
      const spent = ownerBalanceBefore.sub(ownerBalanceAfter).sub(gasUsed);
      // Should have only spent weiPerCent * 500, not 1000
      const expectedSpend = weiPerCent.mul(500);
      expect(spent).to.be.closeTo(expectedSpend, weiPerCent);
    });

    it("Should reject if sender has no debt", async function () {
      // member1 has positive balance (+500), not in debt
      await expect(
        expenseSplitter.connect(member1).settleDebtWithEth(owner.address, {
          value: weiPerCent.mul(100),
        })
      ).to.be.revertedWith("You have no debt");
    });

    it("Should reject if creditor has no credit", async function () {
      // owner owes but nonMember is not owed anything
      await expenseSplitter.addMember(nonMember.address);
      await expect(
        expenseSplitter.settleDebtWithEth(nonMember.address, {
          value: weiPerCent.mul(100),
        })
      ).to.be.revertedWith("Creditor has no credit");
    });

    it("Should reject if sender is not a member", async function () {
      await expect(
        expenseSplitter.connect(nonMember).settleDebtWithEth(member1.address, {
          value: weiPerCent.mul(100),
        })
      ).to.be.revertedWith("Only members can perform this action");
    });

    it("Should reject if creditor is not a member", async function () {
      await expect(
        expenseSplitter.settleDebtWithEth(nonMember.address, {
          value: weiPerCent.mul(100),
        })
      ).to.be.revertedWith("Creditor must be a member");
    });

    it("Should reject if payment is too small", async function () {
      // Send 1 wei — not enough for even 1 cent
      await expect(
        expenseSplitter.settleDebtWithEth(member1.address, { value: 1 })
      ).to.be.revertedWith("Payment too small");
    });

    it("Should handle partial settlement", async function () {
      // Pay only 200 cents worth out of 500 owed
      const partialWei = weiPerCent.mul(200);

      await expenseSplitter.settleDebtWithEth(member1.address, {
        value: partialWei,
      });

      expect(await expenseSplitter.getBalance(owner.address)).to.equal(-300);
      expect(await expenseSplitter.getBalance(member1.address)).to.equal(300);
    });
  });
});
