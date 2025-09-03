import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Wallet, 
  Menu, 
  X, 
  Home, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  BarChart3,
  LogOut
} from 'lucide-react'
import { useStellar } from '../contexts/StellarContext'
import { useAccount } from '../hooks/useAccount'
import { useIsMounted } from '../hooks/useIsMounted'
import { setAllowed } from '@stellar/freighter-api'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const mounted = useIsMounted()
  const account = useAccount()
  const { balance, loading, disconnectWallet } = useStellar()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Savings', href: '/savings', icon: PiggyBank },
    { name: 'Yield Farming', href: '/yield-farming', icon: TrendingUp },
    { name: 'Inflation Hedge', href: '/inflation-hedge', icon: Shield },
  ]

  const isLandingPage = location.pathname === '/'

  if (isLandingPage) {
    return <>{children}</>
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navbar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Aureus</h1>
            </div>
            
            <div className="ml-4 flex items-center space-x-4">
              {mounted && account && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{parseFloat(balance).toFixed(2)} XLM</span>
                </div>
              )}
              
              <WalletButton 
                mounted={mounted}
                account={account}
                loading={loading}
                onDisconnect={disconnectWallet}
              />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation }) => {
  const location = useLocation()
  
  return (
    <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Aureus</span>
          </div>
        </div>
        
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon 
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} 
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

const WalletButton = ({ mounted, account, loading, onDisconnect }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  
  const handleConnect = async () => {
    try {
      await setAllowed();
      // Refresh the page to update account state
      window.location.reload();
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  // Show loading state if not mounted yet
  if (!mounted) {
    return (
      <div className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!account) {
    return (
      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    )
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      >
        <Wallet className="w-4 h-4 mr-2 text-green-500" />
        <span className="hidden sm:block">
          {account.displayName}
        </span>
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
            <div className="font-medium">Connected</div>
            <div className="text-xs text-gray-500 font-mono break-all">
              {account.address}
            </div>
          </div>
          <button
            onClick={() => {
              onDisconnect()
              setShowDropdown(false)
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}

export default Layout
