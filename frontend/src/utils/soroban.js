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
  Contract,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk'
import { signTransaction } from '@stellar/freighter-api'

// Soroban RPC Server (Testnet)
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org'
const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

// Initialize Soroban RPC client
const server = new rpc.Server(SOROBAN_RPC_URL)

/**
 * Build and submit a Soroban contract invocation
 * @param {string} contractAddress - Contract address
 * @param {string} functionName - Function name to call
 * @param {Array} args - Function arguments
 * @param {string} userAddress - User's public key
 * @param {string} memo - Optional transaction memo
 * @returns {Promise} Transaction result
 */
export async function invokeContract(contractAddress, functionName, args = [], userAddress, memo = '') {
  try {
    console.log(`Invoking ${contractAddress}.${functionName} with args:`, args)

    // Load user account
    const horizonServer = new Horizon.Server(HORIZON_URL)
    const account = await horizonServer.loadAccount(userAddress)

    // Convert arguments to Soroban format
    const sorobanArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return nativeToScVal(arg)
      } else if (typeof arg === 'number' || typeof arg === 'bigint') {
        return nativeToScVal(arg, { type: 'i128' })
      } else if (StrKey.isValidEd25519PublicKey(arg)) {
        return Address.fromString(arg).toScVal()
      }
      return nativeToScVal(arg)
    })

    // Build the contract call operation using invokeHostFunction
    const contract = new Contract(contractAddress)
    const contractOperation = Operation.invokeHostFunction({
      func: contract.call(functionName, ...sorobanArgs),
      auth: []
    })

    // Build the transaction
    let transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contractOperation)
      .setTimeout(30)

    if (memo) {
      transaction = transaction.addMemo(Memo.text(memo))
    }

    transaction = transaction.build()

    // Simulate the transaction first
    console.log('Simulating transaction...')
    const simulationResult = await server.simulateTransaction(transaction)
    
    if (rpc.Api.isSimulationError(simulationResult)) {
      console.error('Simulation error:', simulationResult.error)
      throw new Error(`Simulation failed: ${simulationResult.error}`)
    }

    console.log('Simulation successful:', simulationResult)

    // Prepare the transaction with simulation results
    const preparedTransaction = rpc.assembleTransaction(
      transaction,
      simulationResult
    )

    // Sign the transaction
    console.log('Requesting transaction signature...')
    const signedTransaction = await signTransaction(preparedTransaction.toXDR(), {
      network: NETWORK_PASSPHRASE,
    })

    // Submit the transaction
    console.log('Submitting transaction...')
    const transactionResult = await server.sendTransaction(
      TransactionBuilder.fromXDR(signedTransaction, NETWORK_PASSPHRASE)
    )

    console.log('Transaction submitted:', transactionResult)

    // Wait for confirmation if successful
    if (transactionResult.status === 'PENDING') {
      console.log('Waiting for transaction confirmation...')
      let attempt = 0
      const maxAttempts = 10
      
      while (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
        
        const txResult = await server.getTransaction(transactionResult.hash)
        
        if (txResult.status === 'SUCCESS') {
          console.log('Transaction confirmed successfully!')
          return {
            success: true,
            hash: transactionResult.hash,
            result: txResult,
          }
        } else if (txResult.status === 'FAILED') {
          console.error('Transaction failed:', txResult)
          throw new Error(`Transaction failed: ${txResult.resultXdr}`)
        }
        
        attempt++
      }
      
      throw new Error('Transaction confirmation timeout')
    }

    return {
      success: true,
      hash: transactionResult.hash,
      result: transactionResult,
    }

  } catch (error) {
    console.error('Contract invocation error:', error)
    throw error
  }
}

/**
 * Call a read-only contract function (view/pure functions)
 * @param {string} contractAddress - Contract address
 * @param {string} functionName - Function name to call
 * @param {Array} args - Function arguments
 * @returns {Promise} Function result
 */
export async function readContract(contractAddress, functionName, args = []) {
  try {
    console.log(`Reading ${contractAddress}.${functionName} with args:`, args)

    // Create a dummy account for simulation
    const dummyAccount = new Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      '0'
    )

    // Convert arguments to Soroban format
    const sorobanArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return nativeToScVal(arg)
      } else if (typeof arg === 'number' || typeof arg === 'bigint') {
        return nativeToScVal(arg, { type: 'i128' })
      } else if (StrKey.isValidEd25519PublicKey(arg)) {
        return Address.fromString(arg).toScVal()
      }
      return nativeToScVal(arg)
    })

    // Build the contract call operation for simulation
    const contract = new Contract(contractAddress)
    const contractOperation = Operation.invokeHostFunction({
      func: contract.call(functionName, ...sorobanArgs),
      auth: []
    })

    // Build the transaction for simulation only
    const transaction = new TransactionBuilder(dummyAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contractOperation)
      .setTimeout(30)
      .build()

    // Simulate the transaction to get the result
    const simulationResult = await server.simulateTransaction(transaction)
    
    if (rpc.Api.isSimulationError(simulationResult)) {
      console.error('Read simulation error:', simulationResult.error)
      throw new Error(`Read failed: ${simulationResult.error}`)
    }

    // Extract the return value
    if (simulationResult.result && simulationResult.result.retval) {
      const result = scValToNative(simulationResult.result.retval)
      console.log('Read result:', result)
      return result
    }

    return null

  } catch (error) {
    console.error('Contract read error:', error)
    throw error
  }
}

/**
 * Get contract balance for an address
 * @param {string} contractAddress - Contract address
 * @param {string} userAddress - User's address
 * @returns {Promise<number>} Balance
 */
export async function getContractBalance(contractAddress, userAddress) {
  try {
    return await readContract(contractAddress, 'get_balance', [userAddress])
  } catch (error) {
    console.warn('Failed to get contract balance:', error)
    return 0
  }
}

/**
 * Convert Stellar stroops to XLM
 * @param {string|number} stroops
 * @returns {string}
 */
export function stroopsToXlm(stroops) {
  return Operation.fromXDRAmount(stroops.toString())
}

/**
 * Convert XLM to stroops
 * @param {string|number} xlm
 * @returns {string}
 */
export function xlmToStroops(xlm) {
  return Operation.toXDRAmount(xlm.toString())
}

/**
 * Validate a Stellar address
 * @param {string} address
 * @returns {boolean}
 */
export function isValidStellarAddress(address) {
  return StrKey.isValidEd25519PublicKey(address)
}

/**
 * Format contract address for display
 * @param {string} address
 * @returns {string}
 */
export function formatContractAddress(address) {
  if (!address) return 'Not Deployed'
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

export { server, NETWORK_PASSPHRASE, HORIZON_URL }