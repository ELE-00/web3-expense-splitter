import hre from "hardhat";
import "dotenv/config";

async function main() {
  const ethUsdPriceFeed = process.env.ETH_USD_PRICE_FEED;
  const eurUsdPriceFeed = process.env.EUR_USD_PRICE_FEED;

  if (!ethUsdPriceFeed || !eurUsdPriceFeed) {
    throw new Error("Missing price feed addresses in .env — see .env.example");
  }

  const Factory = await hre.ethers.getContractFactory("ExpenseSplitterFactory");
  const factory = await Factory.deploy(ethUsdPriceFeed, eurUsdPriceFeed);
  await factory.deployed();

  console.log("ExpenseSplitterFactory deployed to:", factory.address);
  console.log("ETH/USD Price Feed:", ethUsdPriceFeed);
  console.log("EUR/USD Price Feed:", eurUsdPriceFeed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
