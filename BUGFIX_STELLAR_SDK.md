# Stellar SDK Import Fix

## Issue
The frontend was throwing a runtime error:
```
soroban.js:10 Uncaught TypeError: Cannot read properties of undefined (reading 'Server')
```

## Root Cause
The Stellar SDK v14.x changed its export structure. The old import pattern:
```javascript
import * as StellarSdk from '@stellar/stellar-sdk'
const server = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL)
```

Was not working with the current SDK version.

## Solution
Updated to use correct named imports from the SDK based on v14.x structure:

### Before (soroban.js)
```javascript
import * as StellarSdk from '@stellar/stellar-sdk'
const server = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL)
```

### After (soroban.js) - Final Working Version
```javascript
import { 
  Horizon,
  rpc,
  Networks, 
  TransactionBuilder, 
  BASE_FEE, 
  Operation,
  Account,
  Memo,
  StrKey,
  Address,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk'

// Correct usage with rpc namespace
const server = new rpc.Server(SOROBAN_RPC_URL)
const horizonServer = new Horizon.Server(HORIZON_URL)

// Use rpc.Api and rpc.assembleTransaction
if (rpc.Api.isSimulationError(simulationResult)) { ... }
const preparedTransaction = rpc.assembleTransaction(transaction, simulationResult)
```

### StellarContext.jsx Updates
```javascript
// Before
import * as StellarSdk from '@stellar/stellar-sdk'
const stellarServer = new StellarSdk.Horizon.Server(url)

// After  
import { Horizon, Networks } from '@stellar/stellar-sdk'
const stellarServer = new Horizon.Server(url)
```

### Key Discovery
The Stellar SDK v14.x exports structure:
- `SorobanRpc` does NOT exist as named export
- Use `rpc` instead: `rpc.Server`, `rpc.Api`, `rpc.assembleTransaction`
- Horizon server: `Horizon.Server` (not `Server as HorizonServer`)

## Files Updated
1. `src/utils/soroban.js` - Complete refactor of imports
2. `src/contexts/StellarContext.jsx` - Updated Horizon server import

## Verification
- ✅ Build passes: `npm run build`
- ✅ Dev server starts: `npm run dev`  
- ✅ No runtime import errors

## Result
The frontend now properly imports and uses the Stellar SDK v14.x without any runtime errors. All Soroban contract integration functionality should work correctly.