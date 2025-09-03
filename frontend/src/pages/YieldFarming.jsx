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
import WalletConnect from '../components/WalletConnect'

const YieldFarming = () => {
  const { 
    isConnected, 
    loading, 
    depositForYield, 
    harvestYield 
  } = useStellar()
  
  const [farmingData, setFarmingData] = useState({
    totalStaked: 0,
    totalEarned: 0,
    pendingRewards: 0,
    apy: 12.5
  })
  
  const [depositAmount, setDepositAmount] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const [isHarvesting, setIsHarvesting] = useState(false)

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

  useEffect(() => {
    if (isConnected) {
      setFarmingData({
        totalStaked: 4200.50,
        totalEarned: 325.75,
        pendingRewards: 125.30,
        apy: 12.5
      })
    }
  }, [isConnected])

  const handleDeposit = async (poolId) => {
    if (!depositAmount || isDepositing) return
    
    try {
      setIsDepositing(true)
      const amount = parseFloat(depositAmount) * 1e7
      await depositForYield(amount)
      
      setFarmingData(prev => ({
        ...prev,
        totalStaked: prev.totalStaked + parseFloat(depositAmount)
      }))
      
      setDepositAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
    } finally {
      setIsDepositing(false)
    }
  }

  const handleHarvest = async () => {
    if (isHarvesting) return
    
    try {
      setIsHarvesting(true)
      await harvestYield()
      
      setFarmingData(prev => ({
        ...prev,
        totalEarned: prev.totalEarned + prev.pendingRewards,
        pendingRewards: 0
      }))
    } catch (error) {
      console.error('Harvest failed:', error)
    } finally {
      setIsHarvesting(false)
    }
  }

  if (!isConnected) {
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OverviewCard 
          title="Total Staked"
          value={`$${farmingData.totalStaked.toLocaleString()}`}
          icon={Droplets}
          color="bg-blue-500"
        />
        
        <OverviewCard 
          title="Pending Rewards"
          value={`$${farmingData.pendingRewards.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        
        <OverviewCard 
          title="Total Earned"
          value={`$${farmingData.totalEarned.toFixed(2)}`}
          subtitle="All time"
          icon={Target}
          color="bg-purple-500"
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
            Harvest All Rewards (${farmingData.pendingRewards.toFixed(2)})
          </button>
          
          <button className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 flex items-center justify-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Liquidity
          </button>
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

const OverviewCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
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
