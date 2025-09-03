import React, { useState, useEffect } from 'react'
import { 
  PiggyBank, 
  Plus, 
  Minus, 
  TrendingUp, 
  Lock, 
  Unlock,
  Clock,
  DollarSign,
  RefreshCw,
  AlertCircle,
  AlertTriangle
} from 'lucide-react'
import { useStellar } from '../contexts/StellarContext'
import { useAccount } from '../hooks/useAccount'
import { useIsMounted } from '../hooks/useIsMounted'
import WalletConnect from '../components/WalletConnect'
import toast from 'react-hot-toast'

const Savings = () => {
  const mounted = useIsMounted()
  const account = useAccount()
  const { 
    balance,
    loading, 
    depositToSavings, 
    withdrawFromSavings, 
    getSavingsBalance,
    contractAddresses
  } = useStellar()
  
  const [savingsData, setSavingsData] = useState({
    balance: 0,
    lockedUntil: 0,
    interestRate: 4.2,
    totalEarned: 0
  })
  
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [lockDuration, setLockDuration] = useState(30) // days
  const [loadingData, setLoadingData] = useState(false)

  // Fetch real savings data when account is connected
  useEffect(() => {
    if (account?.address && contractAddresses.SAVINGS) {
      fetchSavingsData()
    } else if (account?.address) {
      // Mock data when contract is not deployed
      setSavingsData({
        balance: 0,
        lockedUntil: 0,
        interestRate: 4.2,
        totalEarned: 0
      })
    }
  }, [account?.address, contractAddresses.SAVINGS])

  const fetchSavingsData = async () => {
    try {
      setLoadingData(true)
      const savingsBalance = await getSavingsBalance()
      
      setSavingsData({
        balance: savingsBalance,
        lockedUntil: 0, // TODO: Get from contract
        interestRate: 4.2, // TODO: Get from contract
        totalEarned: savingsBalance * 0.05 // Mock 5% earned
      })
    } catch (error) {
      console.error('Error fetching savings data:', error)
      toast.error('Failed to fetch savings data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || isDepositing) return
    
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > parseFloat(balance)) {
      toast.error('Insufficient balance')
      return
    }

    if (!contractAddresses.SAVINGS) {
      toast.error('Savings contract not deployed yet')
      return
    }
    
    try {
      setIsDepositing(true)
      toast.loading('Processing deposit...', { id: 'deposit' })
      
      // Convert to smallest unit if needed
      const stellarAmount = amount * 1e7 // Stellar uses 7 decimal places
      await depositToSavings(stellarAmount, lockDuration)
      
      toast.success('Deposit successful!', { id: 'deposit' })
      
      // Refresh data
      await fetchSavingsData()
      setDepositAmount('')
      
    } catch (error) {
      console.error('Deposit failed:', error)
      toast.error(error.message || 'Deposit failed', { id: 'deposit' })
    } finally {
      setIsDepositing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || isWithdrawing) return
    
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > savingsData.balance) {
      toast.error('Insufficient savings balance')
      return
    }

    if (!contractAddresses.SAVINGS) {
      toast.error('Savings contract not deployed yet')
      return
    }

    // Check if funds are locked
    if (savingsData.lockedUntil > Date.now()) {
      toast.error('Funds are still locked')
      return
    }
    
    try {
      setIsWithdrawing(true)
      toast.loading('Processing withdrawal...', { id: 'withdraw' })
      
      const stellarAmount = amount * 1e7
      await withdrawFromSavings(stellarAmount)
      
      toast.success('Withdrawal successful!', { id: 'withdraw' })
      
      // Refresh data
      await fetchSavingsData()
      setWithdrawAmount('')
      
    } catch (error) {
      console.error('Withdraw failed:', error)
      toast.error(error.message || 'Withdrawal failed', { id: 'withdraw' })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const isLocked = savingsData.lockedUntil > Date.now()
  const lockTimeRemaining = isLocked ? 
    Math.ceil((savingsData.lockedUntil - Date.now()) / (24 * 60 * 60 * 1000)) : 0

  if (!mounted) {
    return <SavingsSkeleton />
  }

  if (!account) {
    return <WalletNotConnected />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Smart Savings</h1>
        <p className="mt-2 text-gray-600">
          Earn interest while protecting against inflation with automated rebalancing
        </p>
      </div>

      {/* Contract Status Warning */}
      {!contractAddresses.SAVINGS && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Savings Contract Not Deployed</h3>
              <p className="text-sm text-yellow-700 mt-1">
                The savings contract is not yet deployed to the network. 
                Deposit and withdrawal functionality is currently unavailable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OverviewCard 
          title="Total Balance"
          value={`$${savingsData.balance.toFixed(2)}`}
          icon={DollarSign}
          color="bg-blue-500"
          isLoading={loadingData}
        />
        
        <OverviewCard 
          title="Interest Rate"
          value={`${savingsData.interestRate}%`}
          subtitle="APY"
          icon={TrendingUp}
          color="bg-green-500"
        />
        
        <OverviewCard 
          title="Total Earned"
          value={`$${savingsData.totalEarned.toFixed(2)}`}
          subtitle="All time"
          icon={PiggyBank}
          color="bg-purple-500"
        />
        
        <OverviewCard 
          title="Lock Status"
          value={isLocked ? `${lockTimeRemaining} days` : 'Unlocked'}
          subtitle={isLocked ? 'remaining' : 'Available'}
          icon={isLocked ? Lock : Unlock}
          color={isLocked ? 'bg-orange-500' : 'bg-green-500'}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit/Withdraw */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Funds</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deposit */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Plus className="w-4 h-4 mr-2 text-green-500" />
                  Deposit
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (XLM)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={balance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {parseFloat(balance).toFixed(2)} XLM
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lock Duration
                  </label>
                  <select
                    value={lockDuration}
                    onChange={(e) => setLockDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={0}>No lock (3.5% APY)</option>
                    <option value={30}>30 days (4.2% APY)</option>
                    <option value={90}>90 days (4.8% APY)</option>
                    <option value={365}>1 year (5.5% APY)</option>
                  </select>
                </div>
                
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || isDepositing || loading || !contractAddresses.SAVINGS}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDepositing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {!contractAddresses.SAVINGS ? 'Contract Not Deployed' : 
                   isDepositing ? 'Depositing...' : 'Deposit'}
                </button>
              </div>

              {/* Withdraw */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Minus className="w-4 h-4 mr-2 text-red-500" />
                  Withdraw
                </h4>
                
                {isLocked && (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-sm text-orange-700">
                        Funds locked for {lockTimeRemaining} more days
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (XLM)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={savingsData.balance}
                    disabled={isLocked}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {savingsData.balance.toFixed(2)} XLM
                  </p>
                </div>
                
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || isWithdrawing || loading || isLocked || parseFloat(withdrawAmount) > savingsData.balance || !contractAddresses.SAVINGS}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isWithdrawing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Minus className="w-4 h-4 mr-2" />
                  )}
                  {!contractAddresses.SAVINGS ? 'Contract Not Deployed' :
                   isLocked ? 'Funds Locked' :
                   isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Earnings Projection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Projection</h3>
            
            <div className="space-y-4">
              <EarningsRow period="1 Month" amount={savingsData.balance * 0.042 / 12} />
              <EarningsRow period="3 Months" amount={savingsData.balance * 0.042 / 4} />
              <EarningsRow period="1 Year" amount={savingsData.balance * 0.042} />
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Earn competitive interest on your deposits</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Automatic rebalancing protects against inflation</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Lock funds for higher APY rates</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Withdraw anytime (if not locked)</span>
              </div>
            </div>
          </div>

          {/* Inflation Protection */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inflation Protection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your savings are automatically rebalanced when inflation rises above 2%
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <span>Current US CPI:</span>
              <span className="font-medium text-orange-600">3.2%</span>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Last rebalanced: 2 days ago
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const WalletNotConnected = () => (
  <div className="flex flex-col items-center justify-center min-h-96 max-w-md mx-auto">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <PiggyBank className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
      <p className="text-gray-600 mb-4">Connect your Stellar wallet to start saving</p>
    </div>
    
    <WalletConnect />
  </div>
)

const SavingsSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto animate-pulse">
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-96"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const OverviewCard = ({ title, value, subtitle, icon: Icon, color, isLoading = false }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    )}
  </div>
)

const EarningsRow = ({ period, amount }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{period}:</span>
    <span className="text-sm font-medium text-gray-900">
      ${amount.toFixed(2)}
    </span>
  </div>
)

export default Savings
