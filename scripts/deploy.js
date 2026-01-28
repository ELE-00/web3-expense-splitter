import hre from "hardhat";
import "dotenv/config";

async function main() {
  const Factory = await hre.ethers.getContractFactory("ExpenseSplitterFactory");
  const factory = await Factory.deploy();
  await factory.deployed();

  console.log("ExpenseSplitterFactory deployed to:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});