import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  PiggyBank, 
  Zap,
  BarChart3,
  Globe,
  Lock,
  DollarSign,
  Star
} from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Aureus</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
          </div>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Launch App
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Protect Your Wealth from{' '}
              <span className="text-primary-600">Inflation</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Smart DeFi solutions on Stellar that automatically hedge against inflation, 
              optimize yields, and preserve your purchasing power across global markets.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          
          {/* Hero Image/Illustration */}
          <div className="mt-20">
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FeatureCard 
                    icon={Shield}
                    title="Inflation Protection"
                    description="Automatic asset rebalancing based on real-time inflation data"
                  />
                  <FeatureCard 
                    icon={TrendingUp}
                    title="Yield Optimization"
                    description="Maximize returns with intelligent DeFi strategies"
                  />
                  <FeatureCard 
                    icon={Globe}
                    title="Global Markets"
                    description="Access worldwide opportunities through Stellar network"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Complete DeFi Solution
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to protect and grow your wealth
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureBox 
              icon={PiggyBank}
              title="Smart Savings"
              description="Earn interest while protecting against inflation with automated rebalancing"
              color="bg-blue-500"
            />
            <FeatureBox 
              icon={TrendingUp}
              title="Yield Farming"
              description="Provide liquidity and earn rewards across multiple DeFi protocols"
              color="bg-green-500"
            />
            <FeatureBox 
              icon={Shield}
              title="Hedge Positions"
              description="Automatically allocate assets based on inflation indicators"
              color="bg-purple-500"
            />
            <FeatureBox 
              icon={BarChart3}
              title="Oracle Data"
              description="Real-time economic data feeds for intelligent decision making"
              color="bg-orange-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How Aureus Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Three simple steps to financial protection
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <Step 
              number="01"
              title="Connect & Deposit"
              description="Connect your Stellar wallet and deposit stablecoins to start protecting your wealth"
              icon={DollarSign}
            />
            <Step 
              number="02"
              title="Choose Strategy"
              description="Select from savings, yield farming, or inflation hedge strategies based on your goals"
              icon={Star}
            />
            <Step 
              number="03"
              title="Earn & Protect"
              description="Our smart contracts automatically optimize your positions using real-time data"
              icon={Zap}
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Why Choose Aureus?
              </h2>
              
              <div className="mt-8 space-y-6">
                <Benefit 
                  icon={Lock}
                  title="Secure & Decentralized"
                  description="Built on Stellar's secure blockchain with audited smart contracts"
                />
                <Benefit 
                  icon={Zap}
                  title="Automated Optimization"
                  description="AI-powered rebalancing based on real-world economic indicators"
                />
                <Benefit 
                  icon={Globe}
                  title="Global Accessibility"
                  description="Access from anywhere with low fees and fast transactions"
                />
                <Benefit 
                  icon={BarChart3}
                  title="Real-time Analytics"
                  description="Track your performance with comprehensive dashboards"
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Start Protecting Your Wealth Today</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span>No minimum deposit required</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span>Withdraw anytime</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span>Transparent fee structure</span>
                  </div>
                </div>
                
                <Link
                  to="/dashboard"
                  className="inline-flex items-center mt-8 px-6 py-3 bg-white text-primary-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  Launch App
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Aureus</span>
              </div>
              <p className="mt-4 text-gray-400">
                Protecting wealth through intelligent DeFi on Stellar
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Savings</a></li>
                <li><a href="#" className="hover:text-white">Yield Farming</a></li>
                <li><a href="#" className="hover:text-white">Inflation Hedge</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Aureus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm">
      <Icon className="w-6 h-6 text-primary-600" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
)

const FeatureBox = ({ icon: Icon, title, description, color }) => (
  <div className="relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className={`inline-flex items-center justify-center w-12 h-12 ${color} rounded-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
)

const Step = ({ number, title, description, icon: Icon }) => (
  <div className="text-center">
    <div className="relative">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
        <Icon className="w-8 h-8 text-primary-600" />
      </div>
      <div className="absolute -top-2 -right-2 inline-flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full">
        <span className="text-sm font-bold text-white">{number}</span>
      </div>
    </div>
    <h3 className="mt-6 text-xl font-semibold text-gray-900">{title}</h3>
    <p className="mt-4 text-gray-600">{description}</p>
  </div>
)

const Benefit = ({ icon: Icon, title, description }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600">{description}</p>
    </div>
  </div>
)

export default LandingPage
