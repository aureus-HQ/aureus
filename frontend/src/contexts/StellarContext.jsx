import React, { createContext, useContext, useState, useEffect } from 'react'
import * as StellarSdk from '@stellar/stellar-sdk'
import {
  isConnected as isFreighterConnected,
  isAllowed as isFreighterAllowed,
  getAddress as getFreighterAddress,
  requestAccess as requestFreighterAccess,
  signTransaction
} from '@stellar/freighter-api'
import toast from 'react-hot-toast'
import { useAccount } from '../hooks/useAccount'

const StellarContext = createContext()

export const useStellar = () => {
  const context = useContext(StellarContext)
  if (!context) {
    throw new Error('useStellar must be used within a StellarProvider')
  }
  return context
}

export const StellarProvider = ({ children }) => {
  const account = useAccount()
  const [server, setServer] = useState(null)
  const [accountData, setAccountData] = useState(null)
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [contractAddresses, setContractAddresses] = useState({
    SAVINGS: import.meta.env.VITE_SAVINGS_CONTRACT || null,
    DEFI_YIELD: import.meta.env.VITE_DEFI_YIELD_CONTRACT || null, 
    INFLATION_HEDGE: import.meta.env.VITE_INFLATION_HEDGE_CONTRACT || null,
    ORACLE: import.meta.env.VITE_ORACLE_CONTRACT || null
  })

  console.log('StellarProvider: Contract addresses loaded:', contractAddresses)

  useEffect(() => {
    try {
      console.log('Initializing Stellar context...')
      
      // Initialize Stellar server (Testnet for development)
      const stellarServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org')
      setServer(stellarServer)
      console.log('Stellar server initialized')
      
    } catch (err) {
      console.error('Failed to initialize Stellar server:', err)
      const errorMessage = 'Failed to initialize Stellar connection: ' + err.message
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [])

  useEffect(() => {
    if (account?.address && server) {
      loadAccountData(account.address, server)
    }
  }, [account?.address, server])

  const connectWallet = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Requesting wallet connection...');

      // Check if already allowed first
      const isAllowed = await isFreighterAllowed()
      if (!isAllowed) {
        console.log('Requesting access to Freighter wallet...');
        // This should trigger the popup
        await requestFreighterAccess()
        
        // Check again after user grants access
        const isNowAllowed = await isFreighterAllowed()
        if (!isNowAllowed) {
          throw new Error('Wallet access was denied. Please approve the connection request in Freighter.');
        }
      }

      // Get address - this returns an object with address property
      console.log('Getting address from Freighter...');
      const addressResponse = await getFreighterAddress()
      console.log('Address response:', addressResponse);
      
      // Extract the actual address string
      const publicKey = typeof addressResponse === 'string' ? addressResponse : addressResponse.address || addressResponse;
      
      if (!publicKey) {
        throw new Error('Unable to retrieve wallet address from Freighter.');
      }
      
      console.log('Wallet connected successfully:', publicKey);
      toast.success('Wallet connected successfully!')
      
      // The useAccount hook will handle the state update
      window.location.reload(); // Refresh to update the account state
      
    } catch (error) {
      console.error('Error connecting wallet:', error)
      const errorMessage = error.message || 'Unknown wallet connection error';
      setError(errorMessage);
      
      // Provide more helpful error messages with toasts
      if (errorMessage.includes('not found') || errorMessage.includes('not detected')) {
        const message = 'Freighter wallet not detected. Please ensure the extension is installed, reload the page, and try again.';
        setError(message);
        toast.error(message);
      } else if (errorMessage.includes('denied') || errorMessage.includes('rejected')) {
        const message = 'Wallet connection was denied. Please approve the connection request in Freighter.';
        setError(message);
        toast.error(message);
      } else if (errorMessage.includes('User declined access')) {
        const message = 'Connection cancelled. Please try again and approve the request in Freighter.';
        setError(message);
        toast.error(message);
      } else {
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    // Clear account state by refreshing
    window.location.reload();
    toast.success('Wallet disconnected');
  }

  const loadAccountData = async (pubKey, stellarServer) => {
    try {
      const accountData = await stellarServer.loadAccount(pubKey)
      setAccountData(accountData)
      
      // Get XLM balance
      const xlmBalance = accountData.balances.find(balance => 
        balance.asset_type === 'native'
      )
      setBalance(xlmBalance ? xlmBalance.balance : '0')
      
    } catch (error) {
      console.error('Error loading account data:', error)
      if (error.name === 'NotFoundError') {
        // Account not found, probably needs funding
        setBalance('0')
        toast.error('Account not found on Stellar network. Please fund your account first.')
      } else {
        toast.error('Failed to load account data: ' + error.message)
      }
    }
  }

  // Contract interaction helpers
  const callContract = async (contractAddress, functionName, parameters = []) => {
    try {
      if (!contractAddress) {
        throw new Error(`Contract address not set for ${functionName}`)
      }
      
      if (!account?.address) {
        throw new Error('Wallet not connected')
      }

      console.log(`Calling contract ${contractAddress}.${functionName} with params:`, parameters)
      
      // TODO: Implement actual contract calls using Soroban RPC
      // For now, return a simulated response
      toast.success(`Contract call ${functionName} initiated`)
      return { success: true }
      
    } catch (error) {
      console.error('Error calling contract:', error)
      toast.error(`Contract call failed: ${error.message}`)
      throw error
    }
  }

  // Savings contract functions
  const depositToSavings = async (amount) => {
    try {
      setLoading(true)
      console.log('Depositing to savings:', amount)
      
      if (!contractAddresses.SAVINGS) {
        throw new Error('Savings contract not deployed yet')
      }

      // TODO: Replace with actual contract call
      await callContract(contractAddresses.SAVINGS, 'deposit', [amount])
      
      toast.success(`Successfully deposited ${amount} to savings!`)
      return { success: true }
      
    } catch (error) {
      console.error('Deposit failed:', error)
      const message = `Deposit failed: ${error.message}`
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const withdrawFromSavings = async (amount) => {
    try {
      setLoading(true)
      console.log('Withdrawing from savings:', amount)
      
      if (!contractAddresses.SAVINGS) {
        throw new Error('Savings contract not deployed yet')
      }

      await callContract(contractAddresses.SAVINGS, 'withdraw', [amount])
      
      toast.success(`Successfully withdrew ${amount} from savings!`)
      return { success: true }
      
    } catch (error) {
      console.error('Withdraw failed:', error)
      const message = `Withdrawal failed: ${error.message}`
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getSavingsBalance = async () => {
    try {
      if (!contractAddresses.SAVINGS) {
        console.warn('Savings contract not deployed yet')
        return 0
      }

      console.log('Getting savings balance')
      // TODO: Replace with actual contract call
      return 0 // Mock balance for now
      
    } catch (error) {
      console.error('Failed to get savings balance:', error)
      toast.error(`Failed to get savings balance: ${error.message}`)
      throw error
    }
  }

  // DeFi Yield contract functions
  const depositForYield = async (amount) => {
    try {
      setLoading(true)
      console.log('Depositing for yield:', amount)
      
      if (!contractAddresses.DEFI_YIELD) {
        throw new Error('DeFi Yield contract not deployed yet')
      }

      await callContract(contractAddresses.DEFI_YIELD, 'deposit', [amount])
      
      toast.success(`Successfully deposited ${amount} for yield farming!`)
      return { success: true }
      
    } catch (error) {
      console.error('Yield deposit failed:', error)
      const message = `Yield deposit failed: ${error.message}`
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const harvestYield = async () => {
    try {
      setLoading(true)
      console.log('Harvesting yield')
      
      if (!contractAddresses.DEFI_YIELD) {
        throw new Error('DeFi Yield contract not deployed yet')
      }

      await callContract(contractAddresses.DEFI_YIELD, 'harvest', [])
      
      toast.success('Yield harvested successfully!')
      return { success: true }
      
    } catch (error) {
      console.error('Harvest failed:', error)
      const message = `Harvest failed: ${error.message}`
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Inflation Hedge contract functions
  const depositToHedge = async (amount) => {
    try {
      setLoading(true)
      console.log('Depositing to hedge:', amount)
      
      if (!contractAddresses.INFLATION_HEDGE) {
        throw new Error('Inflation Hedge contract not deployed yet')
      }

      await callContract(contractAddresses.INFLATION_HEDGE, 'deposit', [amount])
      
      toast.success(`Successfully deposited ${amount} to inflation hedge!`)
      return { success: true }
      
    } catch (error) {
      console.error('Hedge deposit failed:', error)
      const message = `Hedge deposit failed: ${error.message}`
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const rebalanceHedge = async (country = 'USA') => {
    try {
      setLoading(true)
      console.log('Rebalancing hedge for country:', country)
      
      if (!contractAddresses.INFLATION_HEDGE) {
        throw new Error('Inflation Hedge contract not deployed yet')
      }

      await callContract(contractAddresses.INFLATION_HEDGE, 'rebalance', [country])
      
      toast.success(`Portfolio rebalanced for ${country}!`)
      return { success: true }
      
    } catch (error) {
      console.error('Rebalance failed:', error)
      const message = `Rebalance failed: ${error.message}`
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Oracle functions
  const getInflationData = async (country) => {
    try {
      if (!contractAddresses.ORACLE) {
        console.warn('Oracle contract not deployed yet')
        return { cpi: 3.2, timestamp: Date.now() } // Mock data
      }

      console.log('Getting inflation data for:', country)
      // TODO: Replace with actual contract call
      return { cpi: 3.2, timestamp: Date.now() } // Mock data
      
    } catch (error) {
      console.error('Failed to get inflation data:', error)
      toast.error(`Failed to get inflation data: ${error.message}`)
      throw error
    }
  }

  const value = {
    // State
    isConnected: !!account,
    account,
    publicKey: account?.address || '',
    accountData,
    balance,
    loading,
    error,
    server,
    contractAddresses,
    
    // Actions
    connectWallet,
    disconnectWallet,
    
    // Contract interactions
    depositToSavings,
    withdrawFromSavings,
    getSavingsBalance,
    depositForYield,
    harvestYield,
    depositToHedge,
    rebalanceHedge,
    getInflationData,
    callContract,
  }

  return (
    <StellarContext.Provider value={value}>
      {children}
    </StellarContext.Provider>
  )
}
