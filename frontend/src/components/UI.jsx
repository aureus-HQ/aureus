import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <RefreshCw 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  )
}

export const ErrorMessage = ({ 
  title = 'Something went wrong',
  message,
  onRetry,
  className = ''
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {message && (
      <p className="text-gray-600 mb-4">{message}</p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    )}
  </div>
)

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <LoadingSpinner size="xl" className="text-primary-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)
