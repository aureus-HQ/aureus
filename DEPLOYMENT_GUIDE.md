# Aureus Contract Deployment Guide

## Current Status
✅ **Frontend integration complete**  
✅ **Mock contract addresses added for testing**  
⏳ **Real contracts need to be deployed**

## Quick Test (Option A)
The frontend now has mock contract addresses and should load without the "Invalid contract ID" error. However, contract calls will fail since the contracts don't actually exist.

**Test the UI:**
1. Restart the dev server: `npm run dev` 
2. Connect your wallet with address: `GBT62PGADYB4T2LJJPJK2YZCB3V3EYGFSV4ZE4Q772PEQVXH27JUJIG3`
3. The UI should load without errors (but deposits will fail)

## Full Deployment (Option B)

### 1. Install Stellar CLI

**Windows (PowerShell as Admin):**
```powershell
winget install --id Stellar.StellarCLI
```

**Manual Install:**
1. Download from: https://github.com/stellar/stellar-cli/releases
2. Extract and add to PATH

**Verify installation:**
```bash
stellar version
```

### 2. Configure Testnet
```bash
# Add testnet network
stellar network add testnet --global --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015"

# Set default network
stellar config --global --network testnet
```

### 3. Add Your Account
```bash
# Add your identity (replace with your secret key)
stellar keys add alice --secret-key YOUR_SECRET_KEY_HERE

# Verify account
stellar keys show alice
```

### 4. Build Contracts
```bash
cd contracts

# Build Oracle contract
cd oracle_contract
cargo build --target wasm32-unknown-unknown --release
cd ..

# Build Savings contract  
cd savings_contract
cargo build --target wasm32-unknown-unknown --release
cd ..

# Build DeFi Yield contract
cd defi_yield_contract  
cargo build --target wasm32-unknown-unknown --release
cd ..

# Build Inflation Hedge contract
cd inflation_hedge_contract
cargo build --target wasm32-unknown-unknown --release
cd ..
```

### 5. Deploy Contracts

**Deploy Oracle first (needed by others):**
```bash
cd oracle_contract
ORACLE_ADDRESS=$(stellar contract deploy --source alice --wasm target/wasm32-unknown-unknown/release/oracle_contract.wasm --network testnet)
echo "Oracle deployed at: $ORACLE_ADDRESS"
cd ..
```

**Deploy Savings contract:**
```bash
cd savings_contract
SAVINGS_ADDRESS=$(stellar contract deploy --source alice --wasm target/wasm32-unknown-unknown/release/savings_contract.wasm --network testnet)
echo "Savings deployed at: $SAVINGS_ADDRESS"
cd ..
```

**Deploy DeFi Yield contract:**
```bash
cd defi_yield_contract
DEFI_ADDRESS=$(stellar contract deploy --source alice --wasm target/wasm32-unknown-unknown/release/defi_yield_contract.wasm --network testnet)
echo "DeFi Yield deployed at: $DEFI_ADDRESS"
cd ..
```

**Deploy Inflation Hedge contract:**
```bash
cd inflation_hedge_contract
HEDGE_ADDRESS=$(stellar contract deploy --source alice --wasm target/wasm32-unknown-unknown/release/inflation_hedge_contract.wasm --network testnet)
echo "Inflation Hedge deployed at: $HEDGE_ADDRESS"
cd ..
```

### 6. Update Environment Variables
Update `frontend/.env` with the deployed addresses:
```env
VITE_SAVINGS_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_DEFI_YIELD_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_INFLATION_HEDGE_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_ORACLE_CONTRACT=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 7. Initialize Contracts

**Initialize Oracle with sample data:**
```bash
# Set sample CPI data
stellar contract invoke --source alice --network testnet --id $ORACLE_ADDRESS -- set_cpi --country USA --cpi 320
stellar contract invoke --source alice --network testnet --id $ORACLE_ADDRESS -- set_cpi --country EUR --cpi 280
```

**Initialize Savings (needs token and oracle addresses):**
```bash
# You'll need to deploy or use existing token addresses
TOKEN_ADDRESS="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM"  # Replace with actual token
stellar contract invoke --source alice --network testnet --id $SAVINGS_ADDRESS -- init --token-address $TOKEN_ADDRESS --oracle-address $ORACLE_ADDRESS
```

**Initialize DeFi Yield:**
```bash
REWARD_TOKEN="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFP6N"  # Replace with reward token
stellar contract invoke --source alice --network testnet --id $DEFI_ADDRESS -- init --token $TOKEN_ADDRESS --reward-token $REWARD_TOKEN
```

**Initialize Inflation Hedge:**
```bash
STABLE_TOKEN="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM"  # USDC equivalent
GOLD_TOKEN="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFP6N"   # Gold token
YIELD_TOKEN="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG7Q2"  # Yield token

stellar contract invoke --source alice --network testnet --id $HEDGE_ADDRESS -- init --oracle $ORACLE_ADDRESS --stable $STABLE_TOKEN --gold $GOLD_TOKEN --yield-token $YIELD_TOKEN
```

### 8. Test the Integration
```bash
cd frontend
npm run dev
```

The app should now work with real deployed contracts!

## Troubleshooting

**Common Issues:**
1. **"Contract not found"** - Check contract address is correct
2. **"Account not found"** - Make sure account is funded
3. **"Transaction failed"** - Check contract is initialized properly
4. **"Insufficient balance"** - Need more XLM for transaction fees

**Verify Deployment:**
```bash
# Check contract exists
stellar contract inspect --source alice --network testnet --id $ORACLE_ADDRESS

# Test a read call
stellar contract invoke --source alice --network testnet --id $ORACLE_ADDRESS -- get_cpi --country USA
```

## Alternative: Use Existing Testnet Contracts

If deployment is complex, you can use existing testnet contracts:
- Find deployed Soroban contracts on: https://stellar.expert/explorer/testnet
- Update `.env` with existing contract addresses
- May need to check contract interfaces match your code

---

**Current Status:** Mock addresses added, ready for testing UI. Deploy real contracts when ready for full functionality.