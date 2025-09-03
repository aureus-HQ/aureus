# Aureus - DeFi Inflation Protection Platform

Aureus is a comprehensive DeFi platform built on Stellar Soroban that provides intelligent protection against inflation through automated asset allocation, yield farming, and smart savings products.

## Architecture

### Smart Contracts (/contracts)

The platform consists of four main Soroban smart contracts:

1. **Savings Contract** (`/contracts/savings_contract`)
   - Interest-bearing savings accounts
   - Inflation-protected deposits with automatic rebalancing
   - Lock periods for higher APY rates
   - Country-specific inflation monitoring

2. **DeFi Yield Contract** (`/contracts/defi_yield_contract`)
   - Yield farming and liquidity provision
   - Auto-allocation based on oracle data
   - Harvest and compound functionality
   - Multi-pool support

3. **Inflation Hedge Contract** (`/contracts/inflation_hedge_contract`)
   - Multi-asset portfolio allocation (stablecoins, gold, yield assets)
   - Automatic rebalancing based on CPI data
   - Country-specific inflation hedging
   - Composable with other contracts

4. **Oracle Contract** (`/contracts/oracle_contract`)
   - Real-time economic data feeds
   - CPI/inflation rates by country
   - Foreign exchange rates
   - Asset price feeds

### Frontend (/frontend)

Modern React application with:
- Stellar wallet integration (Freighter)
- Beautiful, responsive UI with Tailwind CSS
- Real-time portfolio tracking
- Multi-strategy management interface

## Features

### For Users
- **Smart Savings**: Earn interest while protecting against inflation
- **Yield Farming**: Provide liquidity and earn rewards across DeFi protocols  
- **Inflation Hedge**: Automatic multi-asset allocation based on economic indicators
- **Real-time Monitoring**: Track performance and economic indicators
- **Seamless UX**: One-click strategies with automatic optimization

### For Developers
- **Composable Contracts**: Modular design for easy integration
- **Oracle Integration**: Real-world data feeds for smart decisions
- **Event-driven**: Rich event system for monitoring and analytics
- **Stellar Native**: Leverages Stellar's speed and low costs

## Quick Start

### Prerequisites
- Rust and Cargo
- Stellar CLI (`stellar`)
- Node.js 20.19+ or 22.12+
- Freighter wallet

### Deploy Contracts

```bash
# Deploy to Stellar testnet
cd contracts/oracle_contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/oracle_contract.wasm --source <ACCOUNT> --network testnet

cd ../savings_contract  
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/savings_contract.wasm --source <ACCOUNT> --network testnet

cd ../defi_yield_contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/defi_yield_contract.wasm --source <ACCOUNT> --network testnet

cd ../inflation_hedge_contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/inflation_hedge_contract.wasm --source <ACCOUNT> --network testnet
```

### Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env

# Update contract addresses in .env
# Update CONTRACT_ADDRESSES in src/contexts/StellarContext.jsx

npm run dev
```

### Initialize Contracts

```bash
# Initialize Oracle (example)
stellar contract invoke --id <ORACLE_CONTRACT_ID> --source <ACCOUNT> --network testnet -- set_cpi --country USA --cpi 320

# Initialize Savings Contract  
stellar contract invoke --id <SAVINGS_CONTRACT_ID> --source <ACCOUNT> --network testnet -- init --token_address <TOKEN> --oracle_address <ORACLE>

# Repeat for other contracts...
```

## Project Structure

```
aureus/
├── contracts/              # Soroban smart contracts
│   ├── oracle_contract/    # Economic data oracle
│   ├── savings_contract/   # Inflation-protected savings  
│   ├── defi_yield_contract/# Yield farming and liquidity
│   └── inflation_hedge_contract/ # Multi-asset hedging
└── frontend/              # React frontend application
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── contexts/      # Stellar integration
    │   ├── pages/         # Route components
    │   └── App.jsx        # Main application
    └── public/            # Static assets
```

## Contract Interactions

### Savings Flow
1. User deposits stablecoins to Savings Contract
2. Contract allocates funds based on current inflation data from Oracle
3. Auto-rebalancing triggered when inflation exceeds thresholds
4. Interest accrued and compounded automatically

### Yield Farming Flow  
1. User provides liquidity to farming pools
2. Receives LP tokens and farming rewards
3. Auto-allocation adjusts strategy based on Oracle data
4. Harvest rewards and compound for maximum yield

### Inflation Hedge Flow
1. Multi-asset allocation across stables, commodities, yield assets
2. Real-time rebalancing based on CPI data
3. Portfolio optimization for inflation protection
4. Composable with other DeFi strategies

## Security

- **Audited Contracts**: All contracts follow Stellar best practices
- **Oracle Security**: Multiple data sources prevent manipulation
- **Access Controls**: Proper authorization and validation
- **Testing**: Comprehensive test suites for all functionality

## Testnet Deployment

The platform is deployed on Stellar Testnet for testing:

- **Network**: Testnet
- **Horizon**: https://horizon-testnet.stellar.org
- **Contract IDs**: See deployment logs or frontend config

### Getting Testnet XLM
1. Visit [Stellar Laboratory](https://laboratory.stellar.org/#account-creator)
2. Generate account and fund with testnet XLM
3. Import account into Freighter wallet

## Mainnet Deployment

Before mainnet deployment:

1. **Security Audit**: Complete professional security audit
2. **Oracle Setup**: Configure production oracle data feeds  
3. **Liquidity**: Ensure sufficient initial liquidity
4. **Monitoring**: Deploy monitoring and alerting systems
5. **Documentation**: Complete user and developer docs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This software is provided as-is for educational and experimental purposes. Users should conduct their own research and consider the risks before using in production. This is not financial advice.