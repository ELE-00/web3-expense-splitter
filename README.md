# ExpenseSplittr

A decentralized expense splitting application built on Ethereum. Create groups, track shared expenses in EUR, view real-time ETH equivalents via Chainlink price feeds, and settle debts by sending ETH directly to creditors.

## Features

- **MetaMask wallet authentication** with Sepolia network support
- **Group management** via a factory contract pattern - each group is its own smart contract
- **Expense tracking** in EUR cents, automatically split among group members
- **Live EUR/ETH conversion** using Chainlink price feeds (ETH/USD + EUR/USD)
- **On-chain debt settlement** - pay what you owe in ETH, with automatic balance updates and excess refunds
- **Member names** stored locally per group for a human-readable UI

## Tech Stack

**Smart Contracts:** Solidity 0.8.28, Hardhat, OpenZeppelin (ReentrancyGuard), Chainlink AggregatorV3Interface

**Frontend:** React, Vite, ethers.js v6, CSS

**Testing:** Mocha, Chai, Waffle, solidity-coverage (98% coverage)

## Architecture

```
ExpenseSplitterFactory (deployed once)
  |
  |-- createGroup("Trip") --> ExpenseSplitter (one per group)
  |-- createGroup("Rent") --> ExpenseSplitter
  |-- ...
```

- **ExpenseSplitterFactory** - Deploys new ExpenseSplitter contracts and stores their addresses. Holds the Chainlink price feed addresses and passes them to each group.
- **ExpenseSplitter** - Manages members, expenses, balances, and ETH settlement for a single group. Expenses are stored in EUR cents. Balances are calculated on-chain: positive = owed, negative = owes.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MetaMask](https://metamask.io/) browser extension
- Sepolia testnet ETH ([faucet](https://sepoliafaucet.com/))

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd web3-expense-splitter
npm install
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
ETH_USD_PRICE_FEED=0x694AA1769357215DE4FAC081bf1f309aDC325306
EUR_USD_PRICE_FEED=0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910
```

The price feed addresses are Chainlink's public contracts on Sepolia.

### 3. Compile contracts

```bash
npx hardhat compile
```

### 4. Run tests

```bash
npx hardhat test
```

For coverage report:

```bash
npx hardhat coverage
```

### 5. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed factory address and update `frontend/.env.development`:

```
VITE_FACTORY_ADDRESS=0xYourDeployedFactoryAddress
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and connect MetaMask (Sepolia network).

## How It Works

1. **Connect wallet** - MetaMask prompts for account access on Sepolia
2. **Create a group** - Deploys a new ExpenseSplitter contract, you become the owner
3. **Add members** - Owner adds member wallet addresses to the group
4. **Add expenses** - Any member can log an expense (e.g. "Dinner - 25.00 EUR"). The amount is split equally and balances update on-chain
5. **View balances** - Dashboard shows who owes what in EUR and the ETH equivalent (via Chainlink)
6. **Settle up** - Click "Pay" to send ETH to the creditor. The contract converts your ETH payment to EUR cents, updates both balances, and refunds any overpayment

## Project Structure

```
web3-expense-splitter/
├── contracts/
│   ├── ExpenseSplitter.sol        # Core group contract
│   ├── ExpenseSplitterFactory.sol # Factory for deploying groups
│   └── test/
│       └── MockV3Aggregator.sol   # Mock Chainlink feed for tests
├── test/
│   ├── ExpenseSplitter.test.js    # 44 tests
│   └── ExpenseSplitterFactory.test.js # 11 tests
├── scripts/
│   └── deploy.js                  # Deployment script
├── frontend/
│   └── src/
│       ├── components/            # React UI components
│       ├── hooks/                 # useExpenseSplitter, useExpenseSplitterFactory
│       ├── context/               # WalletContext (MetaMask state)
│       ├── constants/             # ABIs, contract addresses, network config
│       ├── utils/                 # localStorage member name helpers
│       └── pages/                 # Login, Dashboard
├── hardhat.config.cjs
├── .env.example
└── package.json
```

## Known Limitations

- **Chainlink requires Sepolia** - Price feeds are not available on local Hardhat. The frontend gracefully handles this by hiding ETH values when unavailable.
- **Integer division** - Splitting an odd amount among members loses up to 1 cent per split due to Solidity integer math.
- **Member names in localStorage** - Display names are stored in the browser, not on-chain. Clearing browser data removes them.

## License

UNLICENSED
