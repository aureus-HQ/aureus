import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Savings from './pages/Savings'
import YieldFarming from './pages/YieldFarming'
import InflationHedge from './pages/InflationHedge'
import { StellarProvider } from './contexts/StellarContext'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <StellarProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/yield-farming" element={<YieldFarming />} />
                <Route path="/inflation-hedge" element={<InflationHedge />} />
              </Routes>
            </Layout>
          </Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </StellarProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
