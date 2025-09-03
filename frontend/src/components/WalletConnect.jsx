import React from 'react';
import { setAllowed } from '@stellar/freighter-api';
import { useStellar } from '../contexts/StellarContext';
import { useAccount } from '../hooks/useAccount';
import { useIsMounted } from '../hooks/useIsMounted';
import { AlertTriangle, ExternalLink, Loader, CheckCircle } from 'lucide-react';

const WalletConnect = () => {
  const mounted = useIsMounted();
  const account = useAccount();
  const { loading, error } = useStellar();

  const handleConnectClick = async () => {
    try {
      await setAllowed();
      // Refresh the page to update account state
      window.location.reload();
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex flex-col items-center p-6 my-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // If already connected, show success message
  if (account) {
    return (
      <div className="flex flex-col items-center p-6 my-8 rounded-lg border border-green-200 bg-green-50 shadow-sm">
        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
        <h2 className="text-lg font-bold text-green-800 mb-2">Wallet Connected</h2>
        <p className="text-sm text-green-700 text-center">
          Connected to {account.displayName}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 my-8 rounded-lg border border-gray-200 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start w-full">
        <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-700">
            Click the button below to connect your Freighter wallet.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Make sure you have Freighter installed and set up.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md w-full">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleConnectClick}
        disabled={loading}
        className={`mt-2 px-6 py-3 rounded-md flex items-center justify-center w-full font-medium transition-all duration-200 ${
          loading
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
        }`}
      >
        {loading ? (
          <>
            <Loader className="animate-spin h-4 w-4 mr-2" />
            Connecting...
          </>
        ) : (
          'Connect Freighter Wallet'
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-2">
          Don't have Freighter installed?
        </p>
        <a 
          href="https://www.freighter.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Install Freighter Wallet
          <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default WalletConnect;
