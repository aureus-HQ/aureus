import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  TrendingUp, 
  TrendingDown,
  RefreshCw, 
  DollarSign,
  PieChart,
  Globe,
  AlertTriangle,
  Plus,
  BarChart3
} from 'lucide-react'
import { useStellar } from '../contexts/StellarContext'
import WalletConnect from '../components/WalletConnect'

const InflationHedge = () => {
  const { 
    isConnected, 
    loading, 
    depositToHedge, 
    rebalanceHedge 
  } = useStellar()
  
  const [hedgeData, setHedgeData] = useState({
    totalValue: 0,
    allocations: {
      stable: 50,
      gold: 30,
      yield: 20
    },
    performance: {
      '1d': 1.2,
      '7d': -0.5,
      '30d': 3.4,
      '1y': 8.1
    }
  })
  
  const [depositAmount, setDepositAmount] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('USA')

  // Mock inflation data
  const [inflationData] = useState({
    USA: { cpi: 3.2, trend: 'up', risk: 'medium' },
    EUR: { cpi: 2.8, trend: 'stable', risk: 'low' },
    GBP: { cpi: 4.1, trend: 'up', risk: 'high' },
    JPY: { cpi: 1.9, trend: 'down', risk: 'low' }
  })

  useEffect(() => {
    if (isConnected) {
      setHedgeData({
        totalValue: 3250.25,
        allocations: {
          stable: 45,
          gold: 35,
          yield: 20
        },
        performance: {
          '1d': 1.2,
          '7d': -0.5,
          '30d': 3.4,
          '1y': 8.1
        }
      })
    }
  }, [isConnected])

  const handleDeposit = async () => {
    if (!depositAmount || isDepositing) return
    
    try {
      setIsDepositing(true)
      const amount = parseFloat(depositAmount) * 1e7
      await depositToHedge(amount)
      
      setHedgeData(prev => ({
        ...prev,
        totalValue: prev.totalValue + parseFloat(depositAmount)
      }))
      
      setDepositAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
    } finally {
      setIsDepositing(false)
    }
  }

  const handleRebalance = async () => {
    if (isRebalancing) return
    
    try {
      setIsRebalancing(true)
      await rebalanceHedge(selectedCountry)
      
      // Update allocations based on inflation data
      const inflation = inflationData[selectedCountry]
      if (inflation.cpi > 3.0) {
        setHedgeData(prev => ({
          ...prev,
          allocations: { stable: 30, gold: 50, yield: 20 }
        }))
      } else {
        setHedgeData(prev => ({
          ...prev,
          allocations: { stable: 50, gold: 30, yield: 20 }
        }))
      }
    } catch (error) {
      console.error('Rebalance failed:', error)
    } finally {
      setIsRebalancing(false)
    }
  }

  if (!isConnected) {
    return <WalletNotConnected />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inflation Hedge</h1>
        <p className="mt-2 text-gray-600">
          Multi-asset portfolio protection against inflation and currency debasement
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <OverviewCard 
          title="Total Value"
          value={`$${hedgeData.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
        />
        
        <PerformanceCard 
          title="24h Performance"
          value={hedgeData.performance['1d']}
          icon={hedgeData.performance['1d'] >= 0 ? TrendingUp : TrendingDown}
        />
        
        <PerformanceCard 
          title="30d Performance"
          value={hedgeData.performance['30d']}
          icon={hedgeData.performance['30d'] >= 0 ? TrendingUp : TrendingDown}
        />
        
        <PerformanceCard 
          title="1y Performance"
          value={hedgeData.performance['1y']}
          icon={hedgeData.performance['1y'] >= 0 ? TrendingUp : TrendingDown}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Portfolio Allocation */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Allocation</h3>
              <button
                onClick={handleRebalance}
                disabled={isRebalancing}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isRebalancing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isRebalancing ? 'Rebalancing...' : 'Auto-Rebalance'}
              </button>
            </div>
            
            <div className="space-y-4">
              <AllocationBar 
                label="Stablecoins"
                percentage={hedgeData.allocations.stable}
                value={hedgeData.totalValue * hedgeData.allocations.stable / 100}
                color="bg-blue-500"
                description="USDC, USDT for stability"
              />
              
              <AllocationBar 
                label="Gold & Commodities"
                percentage={hedgeData.allocations.gold}
                value={hedgeData.totalValue * hedgeData.allocations.gold / 100}
                color="bg-yellow-500"
                description="Precious metals exposure"
              />
              
              <AllocationBar 
                label="Yield Assets"
                percentage={hedgeData.allocations.yield}
                value={hedgeData.totalValue * hedgeData.allocations.yield / 100}
                color="bg-green-500"
                description="Interest-bearing tokens"
              />
            </div>
          </div>
        </div>

        {/* Deposit Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Funds</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country (for rebalancing)
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="USA">United States</option>
                  <option value="EUR">European Union</option>
                  <option value="GBP">United Kingdom</option>
                  <option value="JPY">Japan</option>
                </select>
              </div>
              
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || isDepositing}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isDepositing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isDepositing ? 'Depositing...' : 'Deposit'}
              </button>
            </div>
          </div>

          {/* Country Inflation Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inflation Monitor</h3>
            
            <div className="space-y-3">
              {Object.entries(inflationData).map(([country, data]) => (
                <InflationRow 
                  key={country}
                  country={country}
                  cpi={data.cpi}
                  trend={data.trend}
                  risk={data.risk}
                  isSelected={selectedCountry === country}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrategyInfo />
        <RiskDisclosure />
      </div>
    </div>
  )
}

const WalletNotConnected = () => (
  <div className="flex flex-col items-center justify-center min-h-96 max-w-md mx-auto">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
      <p className="text-gray-600 mb-4">Connect your Stellar wallet to start hedging against inflation</p>
    </div>
    
    <WalletConnect />
  </div>
)

const OverviewCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 ${color} rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
)

const PerformanceCard = ({ title, value, icon: Icon }) => {
  const isPositive = value >= 0
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{value}%
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

const AllocationBar = ({ label, percentage, value, color, description }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <div>
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-sm text-gray-500 ml-2">{percentage}%</span>
      </div>
      <span className="text-sm font-medium text-gray-900">
        ${value.toLocaleString()}
      </span>
    </div>
    
    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
      <div
        className={`${color} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    
    <p className="text-xs text-gray-500">{description}</p>
  </div>
)

const InflationRow = ({ country, cpi, trend, risk, isSelected }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />
      default: return <BarChart3 className="w-3 h-3 text-gray-500" />
    }
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isSelected ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
    }`}>
      <div className="flex items-center">
        <Globe className="w-4 h-4 text-gray-400 mr-2" />
        <span className="font-medium text-gray-900">{country}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{cpi}%</div>
          <div className={`text-xs ${getRiskColor(risk)}`}>{risk} risk</div>
        </div>
        {getTrendIcon(trend)}
      </div>
    </div>
  )
}

const StrategyInfo = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
    
    <div className="space-y-4">
      <InfoStep 
        step="1"
        title="Automatic Allocation"
        description="Funds are distributed across multiple asset classes based on inflation data"
      />
      <InfoStep 
        step="2"
        title="Real-time Monitoring"
        description="Oracle feeds provide up-to-date economic indicators and inflation metrics"
      />
      <InfoStep 
        step="3"
        title="Smart Rebalancing"
        description="Portfolio automatically adjusts when inflation exceeds target thresholds"
      />
    </div>
  </div>
)

const RiskDisclosure = () => (
  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
    <div className="flex items-center mb-4">
      <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
      <h3 className="text-lg font-semibold text-gray-900">Risk Disclosure</h3>
    </div>
    
    <div className="space-y-3 text-sm text-gray-700">
      <p>• Asset values may fluctuate and principal loss is possible</p>
      <p>• Inflation hedging strategies may not fully protect against all price increases</p>
      <p>• Smart contract risks apply to all DeFi interactions</p>
      <p>• Past performance does not guarantee future results</p>
    </div>
    
    <div className="mt-4 text-xs text-gray-500">
      This is not financial advice. Please do your own research.
    </div>
  </div>
)

const InfoStep = ({ step, title, description }) => (
  <div className="flex items-start">
    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
      {step}
    </div>
    <div>
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
)

export default InflationHedge
