#!/bin/bash

# Aureus Contract Deployment Script
# Usage: ./deploy.sh <network> <source_account>
# Example: ./deploy.sh testnet GDXXXXX...

set -e

NETWORK=${1:-testnet}
SOURCE_ACCOUNT=${2}

if [ -z "$SOURCE_ACCOUNT" ]; then
    echo "Error: Please provide source account"
    echo "Usage: ./deploy.sh <network> <source_account>"
    exit 1
fi

echo "🚀 Deploying Aureus contracts to $NETWORK"
echo "📝 Source account: $SOURCE_ACCOUNT"
echo ""

# Build all contracts
echo "🔨 Building contracts..."
cd contracts

# Oracle Contract
echo "📊 Building Oracle Contract..."
cd oracle_contract
cargo build --target wasm32-unknown-unknown --release
ORACLE_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/oracle_contract.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "✅ Oracle deployed: $ORACLE_ID"
cd ..

# Savings Contract  
echo "🏦 Building Savings Contract..."
cd savings_contract
cargo build --target wasm32-unknown-unknown --release
SAVINGS_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/savings_contract.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "✅ Savings deployed: $SAVINGS_ID"
cd ..

# DeFi Yield Contract
echo "📈 Building DeFi Yield Contract..."
cd defi_yield_contract  
cargo build --target wasm32-unknown-unknown --release
DEFI_YIELD_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/defi_yield_contract.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "✅ DeFi Yield deployed: $DEFI_YIELD_ID"
cd ..

# Inflation Hedge Contract
echo "🛡️  Building Inflation Hedge Contract..."
cd inflation_hedge_contract
cargo build --target wasm32-unknown-unknown --release  
INFLATION_HEDGE_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/inflation_hedge_contract.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "✅ Inflation Hedge deployed: $INFLATION_HEDGE_ID"
cd ..

cd ..

echo ""
echo "🎉 All contracts deployed successfully!"
echo ""
echo "📋 Contract Addresses:"
echo "Oracle:          $ORACLE_ID"
echo "Savings:         $SAVINGS_ID" 
echo "DeFi Yield:      $DEFI_YIELD_ID"
echo "Inflation Hedge: $INFLATION_HEDGE_ID"
echo ""
echo "📝 Next steps:"
echo "1. Update frontend/.env with contract addresses"
echo "2. Update src/contexts/StellarContext.jsx with contract addresses"
echo "3. Initialize contracts with required parameters"
echo ""

# Create env file for frontend
cat > frontend/.env << EOF
# Stellar Network Configuration
VITE_STELLAR_NETWORK=$NETWORK
VITE_HORIZON_URL=https://horizon-$NETWORK.stellar.org

# Contract Addresses
VITE_ORACLE_CONTRACT=$ORACLE_ID
VITE_SAVINGS_CONTRACT=$SAVINGS_ID
VITE_DEFI_YIELD_CONTRACT=$DEFI_YIELD_ID
VITE_INFLATION_HEDGE_CONTRACT=$INFLATION_HEDGE_ID

# App Configuration
VITE_APP_NAME=Aureus
VITE_APP_VERSION=1.0.0
EOF

echo "✅ Created frontend/.env with contract addresses"
echo ""
echo "🔧 Sample initialization commands:"
echo ""
echo "# Initialize Oracle with sample data"
echo "stellar contract invoke --id $ORACLE_ID --source $SOURCE_ACCOUNT --network $NETWORK -- set_cpi --country USA --cpi 320"
echo ""
echo "# Initialize Savings Contract"  
echo "stellar contract invoke --id $SAVINGS_ID --source $SOURCE_ACCOUNT --network $NETWORK -- init --token_address <USDC_TOKEN> --oracle_address $ORACLE_ID"
echo ""
echo "# Initialize DeFi Yield Contract"
echo "stellar contract invoke --id $DEFI_YIELD_ID --source $SOURCE_ACCOUNT --network $NETWORK -- init --token <TOKEN> --reward_token <REWARD_TOKEN>"
echo ""
echo "# Initialize Inflation Hedge Contract" 
echo "stellar contract invoke --id $INFLATION_HEDGE_ID --source $SOURCE_ACCOUNT --network $NETWORK -- init --oracle $ORACLE_ID --stable <STABLE> --gold <GOLD> --yield_token <YIELD>"
