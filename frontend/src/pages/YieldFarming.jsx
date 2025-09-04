import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Plus, 
  Minus, 
  RefreshCw, 
  DollarSign,
  Droplets,
  Target,
  Zap,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { useStellar } from '../contexts/StellarContext'
import { useAccount } from '../hooks/useAccount'
import { useIsMounted } from '../hooks/useIsMounted'
import WalletConnect from '../components/WalletConnect'
import toast from 'react-hot-toast'

const YieldFarming = () => {
  const mounted = useIsMounted()
  const account = useAccount()
  const { 
    isConnected, 
    loading, 
    balance,
    depositForYield, 
    harvestYield,
    getYieldBalance,
    contractAddresses
  } = useStellar()
  
  const [farmingData, setFarmingData] = useState({
    totalStaked: 0,
    totalEarned: 0,
    pendingRewards: 0,
    apy: 12.5,
    depositTime: 0
  })
  
  const [depositAmount, setDepositAmount] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const [isHarvesting, setIsHarvesting] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Mock farming pools
  const [pools] = useState([
    {
      id: 1,
      name: 'USDC-XLM',
      apy: 12.5,
      tvl: 2500000,
      userBalance: 4200.50,
      rewards: 125.30,
      isStaked: true
    },
    {
      id: 2,
      name: 'USDT-USDC',
      apy: 8.2,
      tvl: 1800000,
      userBalance: 0,
      rewards: 0,
      isStaked: false
    },
    {
      id: 3,
      name: 'XLM-AQUA',
      apy: 18.7,
      tvl: 950000,
      userBalance: 0,
      rewards: 0,
      isStaked: false
    }
  ])

  // Fetch real yield farming data when account is connected
  useEffect(() => {
    if (account?.address && contractAddresses.DEFI_YIELD) {
      fetchYieldData()
    } else if (account?.address) {
      // Mock data when contract is not deployed
      setFarmingData({
        totalStaked: 0,
        totalEarned: 0,
        pendingRewards: 0,
        apy: 12.5,
        depositTime: 0
      })
    }
  }, [account?.address, contractAddresses.DEFI_YIELD])

  const fetchYieldData = async () => {
    try {
      setLoadingData(true)
      const yieldBalance = await getYieldBalance()
      
      // Calculate pending rewards based on time staked
      const timeStaked = yieldBalance.depositTime > 0 ? 
        (Date.now() / 1000) - yieldBalance.depositTime : 0
      const pendingRewards = yieldBalance.balance * 0.125 * (timeStaked / (365 * 24 * 60 * 60)) // 12.5% APY
      
      setFarmingData({
        totalStaked: yieldBalance.balance,
        totalEarned: yieldBalance.balance * 0.05, // Mock 5% earned
        pendingRewards: Math.max(0, pendingRewards),
        apy: 12.5,
        depositTime: yieldBalance.depositTime
      })
    } catch (error) {
      console.error('Error fetching yield data:', error)
      toast.error('Failed to fetch yield farming data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleDeposit = async (amount) => {
    if (!amount || isDepositing) return
    
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (numAmount > parseFloat(balance)) {
      toast.error('Insufficient balance')
      return
    }

    if (!contractAddresses.DEFI_YIELD) {
      toast.error('DeFi Yield contract not deployed yet')
      return
    }
    
    try {
      setIsDepositing(true)
      toast.loading('Processing deposit...', { id: 'yield-deposit' })
      
      await depositForYield(numAmount)
      
      toast.success('Deposit successful!', { id: 'yield-deposit' })
      
      // Refresh data
      await fetchYieldData()
      setDepositAmount('')
      
    } catch (error) {
      console.error('Deposit failed:', error)
      toast.error(error.message || 'Deposit failed', { id: 'yield-deposit' })
    } finally {
      setIsDepositing(false)
    }
  }

  const handleHarvest = async () => {
    if (isHarvesting || farmingData.pendingRewards === 0) return
    
    if (!contractAddresses.DEFI_YIELD) {
      toast.error('DeFi Yield contract not deployed yet')
      return
    }
    
    try {
      setIsHarvesting(true)
      toast.loading('Harvesting rewards...', { id: 'harvest' })
      
      await harvestYield()
      
      toast.success('Rewards harvested successfully!', { id: 'harvest' })
      
      // Refresh data
      await fetchYieldData()
      
    } catch (error) {
      console.error('Harvest failed:', error)
      toast.error(error.message || 'Harvest failed', { id: 'harvest' })
    } finally {
      setIsHarvesting(false)
    }
  }

  if (!mounted) {
    return <YieldFarmingSkeleton />
  }

  if (!account) {
    return <WalletNotConnected />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yield Farming</h1>
        <p className="mt-2 text-gray-600">
          Provide liquidity and earn rewards across multiple DeFi protocols
        </p>
      </div>

      {/* Contract Status Warning */}
      {!contractAddresses.DEFI_YIELD && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">DeFi Yield Contract Not Deployed</h3>
              <p className="text-sm text-yellow-700 mt-1">
                The yield farming contract is not yet deployed to the network. 
                Deposit and harvest functionality is currently unavailable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OverviewCard 
          title="Total Staked"
          value={`${farmingData.totalStaked.toFixed(2)} XLM`}
          icon={Droplets}
          color="bg-blue-500"
          isLoading={loadingData}
        />
        
        <OverviewCard 
          title="Pending Rewards"
          value={`${farmingData.pendingRewards.toFixed(4)} XLM`}
          icon={TrendingUp}
          color="bg-green-500"
          isLoading={loadingData}
        />
        
        <OverviewCard 
          title="Total Earned"
          value={`${farmingData.totalEarned.toFixed(4)} XLM`}
          subtitle="All time"
          icon={Target}
          color="bg-purple-500"
          isLoading={loadingData}
        />
        
        <OverviewCard 
          title="Average APY"
          value={`${farmingData.apy}%`}
          icon={Zap}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleHarvest}
            disabled={farmingData.pendingRewards === 0 || isHarvesting}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isHarvesting ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5 mr-2" />
            )}
            Harvest All Rewards ({farmingData.pendingRewards.toFixed(4)} XLM)
          </button>
          
          <div className="flex-1 flex gap-2">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount to deposit"
              step="0.01"
              min="0"
              max={balance}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button 
              onClick={() => handleDeposit(depositAmount)}
              disabled={!depositAmount || isDepositing || !contractAddresses.DEFI_YIELD}
              className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isDepositing ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {!contractAddresses.DEFI_YIELD ? 'Contract Not Deployed' :
               isDepositing ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
        </div>
      </div>

      {/* Farming Pools */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Available Pools</h2>
        
        {pools.map((pool) => (
          <PoolCard 
            key={pool.id}
            pool={pool}
            onDeposit={() => handleDeposit(pool.id)}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            isDepositing={isDepositing}
          />
        ))}
      </div>

      {/* Farming Guide */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Yield Farming Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GuideStep 
            step="1"
            title="Provide Liquidity"
            description="Deposit tokens into liquidity pools to earn trading fees"
          />
          <GuideStep 
            step="2"
            title="Earn Rewards"
            description="Receive LP tokens and additional rewards from farming incentives"
          />
          <GuideStep 
            step="3"
            title="Harvest & Compound"
            description="Claim rewards and reinvest for maximum compound growth"
          />
        </div>
      </div>
    </div>
  )
}

const WalletNotConnected = () => (
  <div className="flex flex-col items-center justify-center min-h-96 max-w-md mx-auto">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
      <p className="text-gray-600 mb-4">Connect your Stellar wallet to start yield farming</p>
    </div>
    
    <WalletConnect />
  </div>
)

const YieldFarmingSkeleton = () => (
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
    
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="flex gap-4">
        <div className="flex-1 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1 h-12 bg-gray-200 rounded"></div>
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

const PoolCard = ({ pool, onDeposit, depositAmount, setDepositAmount, isDepositing }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold text-sm">{pool.name.split('-')[0]}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{pool.name}</h3>
              <p className="text-sm text-gray-600">Liquidity Pool</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{pool.apy}%</div>
            <div className="text-sm text-gray-500">APY</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Metric label="TVL" value={`$${(pool.tvl / 1000000).toFixed(1)}M`} />
          <Metric label="Your Balance" value={`$${pool.userBalance.toLocaleString()}`} />
          <Metric label="Pending Rewards" value={`$${pool.rewards.toFixed(2)}`} />
          <Metric 
            label="Status" 
            value={pool.isStaked ? 'Active' : 'Not Staked'}
            valueColor={pool.isStaked ? 'text-green-600' : 'text-gray-500'}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <span className="text-sm font-medium">Details</span>
            <ChevronRight className={`w-4 h-4 ml-1 transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
          
          <div className="flex space-x-2">
            {pool.isStaked && pool.rewards > 0 && (
              <button className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200">
                Harvest
              </button>
            )}
            
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
              {pool.isStaked ? 'Add More' : 'Stake'}
            </button>
            
            {pool.isStaked && (
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
                Unstake
              </button>
            )}
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pool Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pool Type:</span>
                    <span className="text-gray-900">Automated Market Maker</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trading Fee:</span>
                    <span className="text-gray-900">0.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rewards Token:</span>
                    <span className="text-gray-900">AQUA</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-gray-600">Impermanent Loss Risk</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-600">Smart Contract Audited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const Metric = ({ label, value, valueColor = 'text-gray-900' }) => (
  <div>
    <div className="text-sm text-gray-600">{label}</div>
    <div className={`font-medium ${valueColor}`}>{value}</div>
  </div>
)

const GuideStep = ({ step, title, description }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
      <span className="font-bold">{step}</span>
    </div>
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
)

export default YieldFarming
