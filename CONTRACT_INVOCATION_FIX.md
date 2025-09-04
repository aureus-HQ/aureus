# Contract Invocation Fix

## Issue
Frontend was throwing error:
```
Deposit failed: Operation.invokeContract is not a function
Contract call failed: Operation.invokeContract is not a function
```

## Root Cause
The Stellar SDK v14.x doesn't have `Operation.invokeContract`. Soroban contract calls use a different method.

## Solution

### Before (Broken)
```javascript
const contractOperation = Operation.invokeContract({
  contract: contractAddress,
  function: functionName,
  args: sorobanArgs,
})
```

### After (Fixed)
```javascript
// Use Contract class with invokeHostFunction
const contract = new Contract(contractAddress)
const contractOperation = Operation.invokeHostFunction({
  func: contract.call(functionName, ...sorobanArgs),
  auth: []
})
```

## Key Changes

1. **Import Contract class**: Added `Contract` to imports
2. **Use Contract.call()**: Create contract instance and call method
3. **Use invokeHostFunction**: Wrap contract call in `Operation.invokeHostFunction`
4. **Add auth parameter**: Empty auth array for basic calls

## Files Updated
- `src/utils/soroban.js` - Both `invokeContract` and `readContract` functions

## Verification
✅ Build passes: `npm run build`  
✅ No more "Operation.invokeContract is not a function" error  
✅ Ready for real contract calls

## Next Steps
- Deploy contracts to get real contract addresses
- Update .env with contract addresses  
- Test with real contract calls

This fix enables proper Soroban contract invocation using the correct Stellar SDK v14.x methods.