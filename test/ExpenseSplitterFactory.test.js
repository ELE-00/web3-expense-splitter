import { expect } from "chai";
import hre from "hardhat";

describe("ExpenseSplitterFactory", function () {
  let factory;
  let mockEthUsd;
  let mockEurUsd;
  let owner;
  let user1;
  let user2;

  const ETH_USD_PRICE = 250000000000n;
  const EUR_USD_PRICE = 108000000n;

  beforeEach(async function () {
    [owner, user1, user2] = await hre.ethers.getSigners();

    // Deploy mock price feeds
    const MockV3Aggregator = await hre.ethers.getContractFactory("MockV3Aggregator");
    mockEthUsd = await MockV3Aggregator.deploy(8, ETH_USD_PRICE);
    await mockEthUsd.deployed();
    mockEurUsd = await MockV3Aggregator.deploy(8, EUR_USD_PRICE);
    await mockEurUsd.deployed();

    // Deploy factory
    const Factory = await hre.ethers.getContractFactory("ExpenseSplitterFactory");
    factory = await Factory.deploy(mockEthUsd.address, mockEurUsd.address);
    await factory.deployed();
  });

  describe("Deployment", function () {
    it("Should set the deployer as owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should store price feed addresses", async function () {
      expect(await factory.ethUsdPriceFeed()).to.equal(mockEthUsd.address);
      expect(await factory.eurUsdPriceFeed()).to.equal(mockEurUsd.address);
    });

    it("Should start with no groups", async function () {
      const groups = await factory.getGroups();
      expect(groups.length).to.equal(0);
    });
  });

  describe("createGroup", function () {
    it("Should create a new group and store it", async function () {
      await factory.createGroup("Holiday Trip");

      const groups = await factory.getGroups();
      expect(groups.length).to.equal(1);
      expect(groups[0].name).to.equal("Holiday Trip");
      expect(groups[0].contractAddress).to.not.equal(hre.ethers.constants.AddressZero);
    });

    it("Should emit ContractCreated event", async function () {
      await expect(factory.createGroup("Holiday Trip"))
        .to.emit(factory, "ContractCreated");
    });

    it("Should set the caller as owner of the new group", async function () {
      await factory.connect(user1).createGroup("User1 Group");

      const groups = await factory.getGroups();
      const groupAddress = groups[0].contractAddress;

      // Attach to the deployed ExpenseSplitter
      const ExpenseSplitter = await hre.ethers.getContractFactory("ExpenseSplitter");
      const group = ExpenseSplitter.attach(groupAddress);

      expect(await group.owner()).to.equal(user1.address);
    });

    it("Should pass price feed addresses to the new group", async function () {
      await factory.createGroup("Test Group");

      const groups = await factory.getGroups();
      const ExpenseSplitter = await hre.ethers.getContractFactory("ExpenseSplitter");
      const group = ExpenseSplitter.attach(groups[0].contractAddress);

      // Verify Chainlink works by calling getWeiPerCent (would revert if feeds were wrong)
      const weiPerCent = await group.getWeiPerCent();
      expect(weiPerCent).to.be.gt(0);
    });

    it("Should allow anyone to create groups", async function () {
      await factory.connect(user1).createGroup("Group A");
      await factory.connect(user2).createGroup("Group B");

      const groups = await factory.getGroups();
      expect(groups.length).to.equal(2);
      expect(groups[0].name).to.equal("Group A");
      expect(groups[1].name).to.equal("Group B");
    });

    it("Should create independent groups", async function () {
      await factory.createGroup("Group A");
      await factory.createGroup("Group B");

      const groups = await factory.getGroups();
      expect(groups[0].contractAddress).to.not.equal(groups[1].contractAddress);
    });
  });

  describe("getGroups", function () {
    it("Should return all created groups", async function () {
      await factory.createGroup("Trip");
      await factory.connect(user1).createGroup("Rent");
      await factory.createGroup("Food");

      const groups = await factory.getGroups();
      expect(groups.length).to.equal(3);
      expect(groups[0].name).to.equal("Trip");
      expect(groups[1].name).to.equal("Rent");
      expect(groups[2].name).to.equal("Food");
    });
  });
});
