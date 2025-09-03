import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  RefreshCw,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { useStellar } from '../contexts/StellarContext'
import { useAccount } from '../hooks/useAccount'
import { useIsMounted } from '../hooks/useIsMounted'
import WalletConnect from '../components/WalletConnect'

const Dashboard = () => {
  const mounted = useIsMounted()
  const account = useAccount()
  const { balance, loading, getSavingsBalance, getInflationData, contractAddresses } = useStellar()
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalGains: 0,
    gainsPercentage: 0,
    savingsBalance: 0,
    yieldBalance: 0,
    hedgeBalance: 0
  })
  const [inflationData, setInflationData] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  // Fetch real data when account is connected
  useEffect(() => {
    if (account?.address) {
      fetchPortfolioData()
      fetchInflationData()
    }
  }, [account?.address])

  const fetchPortfolioData = async () => {
    try {
      setLoadingData(true)
      
      // Fetch real savings balance if contract is deployed
      let savingsBalance = 0
      try {
        savingsBalance = await getSavingsBalance()
      } catch (error) {
        console.warn('Could not fetch savings balance:', error.message)
      }
      
      // Calculate total portfolio value
      const xlmBalance = parseFloat(balance) || 0
      const totalValue = xlmBalance + savingsBalance
      
      setPortfolioData({
        totalValue,
        totalGains: savingsBalance * 0.05, // Mock 5% gains
        gainsPercentage: savingsBalance > 0 ? 5.0 : 0,
        savingsBalance,
        yieldBalance: 0, // TODO: Fetch from yield contract
        hedgeBalance: 0, // TODO: Fetch from hedge contract
      })
      
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchInflationData = async () => {
    try {
      const data = await getInflationData('USA')
      setInflationData(data)
    } catch (error) {
      console.error('Error fetching inflation data:', error)
    }
  }

  if (!mounted) {
    return <DashboardSkeleton />
  }

  if (!account) {
    return <WalletNotConnected />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor your portfolio and manage your positions
        </p>
      </div>

      {/* Contract Status Warning */}
      {(!contractAddresses.SAVINGS && !contractAddresses.DEFI_YIELD && !contractAddresses.INFLATION_HEDGE) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Contracts Not Deployed</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Smart contracts are not yet deployed. Portfolio data is currently simulated. 
                Deploy contracts to see real functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <PortfolioCard 
          title="Total Portfolio Value"
          value={`$${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={portfolioData.totalGains}
          changePercentage={portfolioData.gainsPercentage}
          icon={DollarSign}
          className="md:col-span-2"
          isLoading={loadingData}
        />
        
        <PortfolioCard 
          title="XLM Balance"
          value={`${parseFloat(balance).toFixed(2)} XLM`}
          subtitle={`≈ $${(parseFloat(balance) * 0.12).toFixed(2)}`} // Mock XLM price
          icon={BarChart3}
          isLoading={loading}
        />
        
        <PortfolioCard 
          title="Active Positions"
          value="3"
          subtitle="Across all products"
          icon={TrendingUp}
        />
      </div>

      {/* Inflation Data */}
      {inflationData && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Economic Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{inflationData.cpi}%</div>
                <div className="text-sm text-gray-500">Current CPI (USA)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+2.1%</div>
                <div className="text-sm text-gray-500">Portfolio Protection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5.2%</div>
                <div className="text-sm text-gray-500">Average APY</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ProductCard
          title="Savings"
          description="Inflation-protected savings with guaranteed returns"
          balance={portfolioData.savingsBalance}
          apy="4.5%"
          icon={PiggyBank}
          href="/savings"
          color="blue"
          isDeployed={!!contractAddresses.SAVINGS}
        />
        
        <ProductCard
          title="Yield Farming"
          description="Liquidity provision across multiple DeFi protocols"
          balance={portfolioData.yieldBalance}
          apy="8.2%"
          icon={TrendingUp}
          href="/yield-farming"
          color="green"
          isDeployed={!!contractAddresses.DEFI_YIELD}
        />
        
        <ProductCard
          title="Inflation Hedge"
          description="Multi-asset portfolio protection against inflation"
          balance={portfolioData.hedgeBalance}
          apy="6.1%"
          icon={Shield}
          href="/inflation-hedge"
          color="purple"
          isDeployed={!!contractAddresses.INFLATION_HEDGE}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={fetchPortfolioData}
            disabled={loadingData}
            className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          
          <Link 
            to="/savings"
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Savings
          </Link>
          
          <Link 
            to="/yield-farming"
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Start Farming
          </Link>
        </div>
      </div>
    </div>
  )
}

const WalletNotConnected = () => (
  <div className="flex flex-col items-center justify-center min-h-96 max-w-md mx-auto">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Not Connected</h3>
      <p className="text-gray-600 mb-4">Connect your Stellar wallet to view your dashboard</p>
    </div>
    
    <WalletConnect />
  </div>
)

const DashboardSkeleton = () => (
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
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      ))}
    </div>
  </div>
)

const PortfolioCard = ({ title, value, change, changePercentage, icon: Icon, subtitle, className = '', isLoading = false }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
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
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}${change.toFixed(2)} ({changePercentage >= 0 ? '+' : ''}{changePercentage}%)
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    )}
  </div>
)

const ProductCard = ({ title, description, balance, apy, icon: Icon, href, color, isDeployed }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {!isDeployed && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${colorClasses[color]} rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium text-green-600">{apy} APY</span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">Balance</p>
          <p className="text-xl font-bold text-gray-900">
            {isDeployed ? `$${balance.toLocaleString()}` : '$0.00'}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Link
          to={href}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-center transition-colors ${
            isDeployed 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isDeployed ? 'Manage' : 'Deploy Contract'}
        </Link>
        <button 
          disabled={!isDeployed}
          className={`p-2 rounded-md transition-colors ${
            isDeployed 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const RecentActivity = () => {
  const activities = [
    {
      type: 'deposit',
      description: 'Deposited to Savings',
      amount: '+$1,000',
      time: '2 hours ago',
      icon: ArrowDownRight,
      color: 'text-green-600'
    },
    {
      type: 'yield',
      description: 'Yield harvested',
      amount: '+$45.30',
      time: '1 day ago',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      type: 'rebalance',
      description: 'Auto-rebalanced portfolio',
      amount: '',
      time: '3 days ago',
      icon: RefreshCw,
      color: 'text-blue-600'
    },
    {
      type: 'withdraw',
      description: 'Withdrew from Yield Farm',
      amount: '-$500',
      time: '1 week ago',
      icon: ArrowUpRight,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gray-50 rounded-lg mr-3">
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
            {activity.amount && (
              <span className={`text-sm font-medium ${activity.color}`}>
                {activity.amount}
              </span>
            )}
          </div>
        ))}
      </div>
      
      <button className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
        View all activity
      </button>
    </div>
  )
}

const MarketInsights = () => {
  const insights = [
    {
      title: 'Inflation Alert',
      description: 'US CPI increased to 3.2%. Consider rebalancing to hedge positions.',
      type: 'warning',
      action: 'Rebalance Now'
    },
    {
      title: 'Yield Opportunity',
      description: 'New liquidity pools available with 15% APY.',
      type: 'info',
      action: 'Explore'
    },
    {
      title: 'Portfolio Health',
      description: 'Your diversification score: 8.5/10. Well balanced!',
      type: 'success',
      action: 'View Details'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-3 mt-1 ${
                insight.type === 'warning' ? 'bg-yellow-400' :
                insight.type === 'info' ? 'bg-blue-400' : 'bg-green-400'
              }`} />
            </div>
            <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
              {insight.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
