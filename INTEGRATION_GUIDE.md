# Aureus Frontend Integration Guide

## Overview

The Aureus frontend has been successfully integrated with Stellar/Soroban smart contracts. This guide explains the integration architecture and how to deploy and use the system.

## Architecture

### Frontend Stack
- **React 19** with Vite build system
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Blockchain Integration
- **Stellar SDK** for blockchain interactions
- **Freighter API** for wallet connectivity
- **Soroban RPC** for smart contract calls
- **Custom Soroban utilities** for contract interaction

## Smart Contracts Integrated

### 1. Savings Contract (`savings_contract`)
**Location**: `contracts/savings_contract/src/lib.rs`

**Functions**:
- `init(token_address, oracle_address)` - Initialize contract
- `deposit(user, amount)` - Deposit funds to savings
- `withdraw(user, amount)` - Withdraw funds if not locked
- `lock_funds(user, duration)` - Lock funds for better APY
- `get_balance(user)` - Get user's savings balance
- `get_lock_status(user)` - Get lock expiration timestamp
- `rebalance(user)` - Auto-rebalance based on inflation data

**Frontend Integration**: `src/pages/Savings.jsx`

### 2. DeFi Yield Contract (`defi_yield_contract`)
**Location**: `contracts/defi_yield_contract/src/lib.rs`

**Functions**:
- `init(token, reward_token)` - Initialize contract
- `deposit_yield(user, amount)` - Deposit for yield farming
- `harvest_yield(user)` - Harvest accumulated rewards
- `provide_liquidity(user, amount_a, amount_b)` - Add liquidity to pools
- `get_stake(user)` - Get stake amount and deposit time

**Frontend Integration**: `src/pages/YieldFarming.jsx`

### 3. Inflation Hedge Contract (`inflation_hedge_contract`)
**Location**: `contracts/inflation_hedge_contract/src/lib.rs`

**Functions**:
- `init(oracle, stable, gold, yield_token)` - Initialize with asset addresses
- `deposit(user, amount)` - Deposit funds for hedging
- `rebalance(user, country)` - Rebalance based on inflation data
- `withdraw(user, amount)` - Withdraw from hedge positions
- `get_allocation(user)` - Get current allocation breakdown

**Frontend Integration**: `src/pages/InflationHedge.jsx`

### 4. Oracle Contract (`oracle_contract`)
**Location**: `contracts/oracle_contract/src/lib.rs`

**Functions**:
- `set_cpi(country, cpi)` - Set inflation rate for country
- `get_cpi(country)` - Get inflation rate
- `set_fx(pair, rate)` - Set FX rates
- `get_fx(pair)` - Get FX rates  
- `set_asset_price(asset, price)` - Set asset prices
- `get_asset_price(asset)` - Get asset prices

**Frontend Integration**: Used throughout all components for inflation data

## Integration Architecture

### Core Files

#### 1. Soroban Utilities (`src/utils/soroban.js`)
- `invokeContract()` - Execute contract transactions
- `readContract()` - Read contract state (view functions)
- `getContractBalance()` - Get user balances
- Transaction signing and submission
- Error handling and retries

#### 2. Stellar Context (`src/contexts/StellarContext.jsx`)
- Wallet connection management
- Contract interaction wrappers
- State management for all contract data
- Loading states and error handling
- Real-time balance updates

#### 3. Wallet Integration (`src/components/WalletConnect.jsx`)
- Freighter wallet connection
- Account display and management
- Connection status indicators
- Error handling for wallet issues

## Deployment Guide

### 1. Deploy Smart Contracts

First, deploy all four contracts to Stellar testnet:

```bash
# Deploy each contract (from contracts directory)
cd contracts/savings_contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/savings_contract.wasm --source $SOURCE_ACCOUNT --network testnet

# Repeat for other contracts:
# - defi_yield_contract
# - inflation_hedge_contract  
# - oracle_contract
```

### 2. Configure Environment

Update `frontend/.env` with deployed contract addresses:

```env
VITE_STELLAR_NETWORK=testnet
VITE_HORIZON_URL=https://horizon-testnet.stellar.org

# Contract Addresses (replace with actual deployed addresses)
VITE_SAVINGS_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_DEFI_YIELD_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_INFLATION_HEDGE_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_ORACLE_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

VITE_APP_NAME=Aureus
VITE_APP_VERSION=1.0.0
```

### 3. Initialize Contracts

Initialize each contract with proper addresses:

```javascript
// Example initialization calls
await invokeContract(ORACLE_CONTRACT, 'set_cpi', ['USA', 320]) // 3.20%
await invokeContract(SAVINGS_CONTRACT, 'init', [TOKEN_ADDRESS, ORACLE_CONTRACT])
await invokeContract(DEFI_YIELD_CONTRACT, 'init', [TOKEN_ADDRESS, REWARD_TOKEN])
await invokeContract(INFLATION_HEDGE_CONTRACT, 'init', [ORACLE_CONTRACT, STABLE_TOKEN, GOLD_TOKEN, YIELD_TOKEN])
```

### 4. Deploy Frontend

```bash
cd frontend
npm install
npm run build

# Deploy dist/ folder to your hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

## User Flow

### 1. Wallet Connection
- User visits the app
- Clicks "Connect Wallet" 
- Freighter extension opens for approval
- User approves connection
- App loads user's account and balances

### 2. Savings Flow
- Navigate to Savings page
- Enter deposit amount
- Choose lock duration (affects APY)
- Sign transaction in Freighter
- Funds are deposited to savings contract
- Auto-rebalancing occurs based on inflation data

### 3. Yield Farming Flow
- Navigate to Yield Farming page
- Enter deposit amount for farming
- Sign deposit transaction
- Earn rewards over time
- Harvest rewards periodically
- Compound earnings for maximum growth

### 4. Inflation Hedge Flow
- Navigate to Inflation Hedge page
- Deposit funds for hedging
- System auto-allocates across stable, gold, and yield assets
- Rebalancing occurs when inflation exceeds thresholds
- Portfolio protects against currency debasement

## Error Handling

The integration includes comprehensive error handling:

- **Network Issues**: Automatic retries with exponential backoff
- **Transaction Failures**: Clear error messages and recovery options
- **Wallet Issues**: Detailed connection troubleshooting
- **Contract Errors**: User-friendly error translations
- **Loading States**: Skeleton loaders and progress indicators

## Security Considerations

- All transactions require user signature via Freighter
- No private keys stored in frontend
- Contract addresses validated before calls
- Amount limits and balance checks
- Protection against common vulnerabilities

## Development Features

- **Hot Reload**: Vite dev server for fast development
- **Type Safety**: PropTypes and careful state management
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: ARIA labels and keyboard navigation
- **Testing**: Component tests and integration tests

## Monitoring and Analytics

The integration supports:
- Transaction monitoring via Stellar explorer
- Contract event logging
- User interaction analytics
- Performance monitoring
- Error tracking and reporting

## Troubleshooting

### Common Issues:

1. **"Contract not deployed"**: Update .env with correct addresses
2. **"Freighter not detected"**: Install Freighter browser extension
3. **"Transaction failed"**: Check account funding and network status
4. **"Insufficient balance"**: Ensure account has enough XLM
5. **"Network error"**: Verify Stellar network connectivity

### Debug Mode:
Enable detailed logging by setting:
```javascript
localStorage.setItem('aureus-debug', 'true')
```

## Future Enhancements

Planned improvements:
- Mainnet deployment support
- Additional asset support
- Advanced trading features
- Mobile app integration
- DeFi protocol integrations
- Cross-chain functionality

## Support

For technical support:
- Check contract addresses in .env
- Verify network connectivity
- Test with small amounts first
- Review browser console for errors
- Ensure Freighter is up to date

---

The Aureus frontend integration provides a complete DeFi experience with savings, yield farming, and inflation hedging capabilities, all powered by Stellar/Soroban smart contracts.