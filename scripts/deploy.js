import hre from "hardhat";
import "dotenv/config";

async function main() {
  const ExpenseSplitter = await hre.ethers.getContractFactory("ExpenseSplitter");
  const expenseSplitter = await ExpenseSplitter.deploy();
  await expenseSplitter.deployed();

  console.log("ExpenseSplitter deployed to:", expenseSplitter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});