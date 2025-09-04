import React, { createContext, useContext, useState, useEffect } from 'react'
import { Horizon, Networks } from '@stellar/stellar-sdk'
import {
  isConnected as isFreighterConnected,
  isAllowed as isFreighterAllowed,
  getAddress as getFreighterAddress,
  requestAccess as requestFreighterAccess,
  signTransaction
} from '@stellar/freighter-api'
import toast from 'react-hot-toast'
import { useAccount } from '../hooks/useAccount'
import { invokeContract, readContract, getContractBalance, formatContractAddress } from '../utils/soroban'

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
      const stellarServer = new Horizon.Server('https://horizon-testnet.stellar.org')
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
      
      // Check if using mock addresses (for testing)
      if (contractAddress.startsWith('CAAAAAAAAA')) {
        console.warn('Using mock contract address - simulating success')
        toast.success(`Contract call ${functionName} simulated (mock contract)`)
        return { success: true, mock: true }
      }
      
      // Use real contract invocation
      const result = await invokeContract(
        contractAddress, 
        functionName, 
        parameters, 
        account.address
      )
      
      toast.success(`Contract call ${functionName} completed successfully!`)
      return result
      
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

      // Convert amount to proper format (assuming 7 decimal places for stroops)
      const amountInStroops = Math.floor(parseFloat(amount) * 10000000)
      
      const result = await callContract(
        contractAddresses.SAVINGS, 
        'deposit', 
        [account.address, amountInStroops]
      )
      
      toast.success(`Successfully deposited ${amount} XLM to savings!`)
      
      // Refresh account data after successful deposit
      if (account?.address && server) {
        await loadAccountData(account.address, server)
      }
      
      return result
      
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

      // Convert amount to proper format
      const amountInStroops = Math.floor(parseFloat(amount) * 10000000)
      
      const result = await callContract(
        contractAddresses.SAVINGS, 
        'withdraw', 
        [account.address, amountInStroops]
      )
      
      toast.success(`Successfully withdrew ${amount} XLM from savings!`)
      
      // Refresh account data after successful withdrawal
      if (account?.address && server) {
        await loadAccountData(account.address, server)
      }
      
      return result
      
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
      if (!contractAddresses.SAVINGS || !account?.address) {
        console.warn('Savings contract not deployed or wallet not connected')
        return 0
      }

      console.log('Getting savings balance for:', account.address)
      
      // Handle mock contracts
      if (contractAddresses.SAVINGS.startsWith('CAAAAAAAAA')) {
        console.warn('Using mock contract - returning mock balance')
        return Math.random() * 1000 // Return random mock balance
      }
      
      const balance = await readContract(
        contractAddresses.SAVINGS,
        'get_balance',
        [account.address]
      )
      
      // Convert from stroops to XLM (assuming 7 decimal places)
      return balance ? (balance / 10000000) : 0
      
    } catch (error) {
      console.error('Failed to get savings balance:', error)
      // Don't show error toast for balance checks as they happen frequently
      console.warn(`Failed to get savings balance: ${error.message}`)
      return 0
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

      // Convert amount to proper format
      const amountInStroops = Math.floor(parseFloat(amount) * 10000000)
      
      const result = await callContract(
        contractAddresses.DEFI_YIELD, 
        'deposit_yield', 
        [account.address, amountInStroops]
      )
      
      toast.success(`Successfully deposited ${amount} XLM for yield farming!`)
      
      // Refresh account data after successful deposit
      if (account?.address && server) {
        await loadAccountData(account.address, server)
      }
      
      return result
      
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

      const result = await callContract(
        contractAddresses.DEFI_YIELD, 
        'harvest_yield', 
        [account.address]
      )
      
      toast.success('Yield harvested successfully!')
      
      // Refresh account data after successful harvest
      if (account?.address && server) {
        await loadAccountData(account.address, server)
      }
      
      return result
      
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

      // Convert amount to proper format
      const amountInStroops = Math.floor(parseFloat(amount) * 10000000)
      
      const result = await callContract(
        contractAddresses.INFLATION_HEDGE, 
        'deposit', 
        [account.address, amountInStroops]
      )
      
      toast.success(`Successfully deposited ${amount} XLM to inflation hedge!`)
      
      // Refresh account data after successful deposit
      if (account?.address && server) {
        await loadAccountData(account.address, server)
      }
      
      return result
      
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

      const result = await callContract(
        contractAddresses.INFLATION_HEDGE, 
        'rebalance', 
        [account.address, country]
      )
      
      toast.success(`Portfolio rebalanced for ${country}!`)
      
      return result
      
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
      
      // Handle mock contracts
      if (contractAddresses.ORACLE.startsWith('CAAAAAAAAA')) {
        const mockCpi = country === 'USA' ? 3.2 : country === 'EUR' ? 2.8 : 4.1
        console.warn('Using mock contract - returning mock CPI:', mockCpi)
        return { cpi: mockCpi, timestamp: Date.now() }
      }
      
      const cpi = await readContract(
        contractAddresses.ORACLE,
        'get_cpi',
        [country]
      )
      
      // Convert CPI from contract format (assuming 2 decimal places, so 320 = 3.20%)
      const formattedCpi = cpi ? (cpi / 100) : 3.2
      
      return { 
        cpi: formattedCpi, 
        timestamp: Date.now() 
      }
      
    } catch (error) {
      console.error('Failed to get inflation data:', error)
      // Return mock data on error to prevent UI breaking
      console.warn('Using mock inflation data due to error:', error.message)
      return { cpi: 3.2, timestamp: Date.now() }
    }
  }

  // Get yield farming balance and stake info
  const getYieldBalance = async () => {
    try {
      if (!contractAddresses.DEFI_YIELD || !account?.address) {
        console.warn('DeFi Yield contract not deployed or wallet not connected')
        return { balance: 0, depositTime: 0 }
      }

      console.log('Getting yield balance for:', account.address)
      
      const stakeInfo = await readContract(
        contractAddresses.DEFI_YIELD,
        'get_stake',
        [account.address]
      )
      
      // stakeInfo should be [balance, depositTime]
      if (Array.isArray(stakeInfo) && stakeInfo.length >= 2) {
        return {
          balance: stakeInfo[0] ? (stakeInfo[0] / 10000000) : 0, // Convert from stroops to XLM
          depositTime: stakeInfo[1] || 0
        }
      }
      
      return { balance: 0, depositTime: 0 }
      
    } catch (error) {
      console.error('Failed to get yield balance:', error)
      return { balance: 0, depositTime: 0 }
    }
  }

  // Get hedge allocation
  const getHedgeAllocation = async () => {
    try {
      if (!contractAddresses.INFLATION_HEDGE || !account?.address) {
        console.warn('Inflation Hedge contract not deployed or wallet not connected')
        return { stable: 0, gold: 0, yield: 0 }
      }

      console.log('Getting hedge allocation for:', account.address)
      
      const allocation = await readContract(
        contractAddresses.INFLATION_HEDGE,
        'get_allocation',
        [account.address]
      )
      
      // allocation should be a map with stable, gold, yield values
      if (allocation) {
        return {
          stable: allocation.stable ? (allocation.stable / 10000000) : 0,
          gold: allocation.gold ? (allocation.gold / 10000000) : 0,
          yield: allocation.yield ? (allocation.yield / 10000000) : 0
        }
      }
      
      return { stable: 0, gold: 0, yield: 0 }
      
    } catch (error) {
      console.error('Failed to get hedge allocation:', error)
      return { stable: 0, gold: 0, yield: 0 }
    }
  }

  // Lock funds in savings
  const lockSavings = async (lockDuration) => {
    try {
      setLoading(true)
      console.log('Locking savings for duration:', lockDuration)
      
      if (!contractAddresses.SAVINGS) {
        throw new Error('Savings contract not deployed yet')
      }

      const result = await callContract(
        contractAddresses.SAVINGS,
        'lock_funds',
        [account.address, lockDuration]
      )
      
      toast.success('Funds locked successfully!')
      return result
      
    } catch (error) {
      console.error('Lock failed:', error)
      const message = `Lock failed: ${error.message}`
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get lock status
  const getLockStatus = async () => {
    try {
      if (!contractAddresses.SAVINGS || !account?.address) {
        return 0
      }

      const lockUntil = await readContract(
        contractAddresses.SAVINGS,
        'get_lock_status',
        [account.address]
      )
      
      return lockUntil || 0
      
    } catch (error) {
      console.error('Failed to get lock status:', error)
      return 0
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
    lockSavings,
    getLockStatus,
    depositForYield,
    harvestYield,
    getYieldBalance,
    depositToHedge,
    rebalanceHedge,
    getHedgeAllocation,
    getInflationData,
    callContract,
    
    // Utility functions
    formatContractAddress,
  }

  return (
    <StellarContext.Provider value={value}>
      {children}
    </StellarContext.Provider>
  )
}
