import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const WriterRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth)
  const location = useLocation()

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading writer panel...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has writer role (and only writer role - exclude admins)
  if (!user || user.role !== 'writer') {
    // Log unauthorized access attempt for security
    console.warn(`Unauthorized access attempt to writer panel by user: ${user?.email || 'unknown'} with role: ${user?.role || 'none'}`)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">🚫 Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            This is a <strong>writers-only</strong> area. Access is strictly limited to verified writers.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <p className="text-red-700">
                <strong>Current role:</strong> <span className="font-mono bg-red-100 px-2 py-1 rounded">{user?.role || 'None'}</span>
              </p>
              <p className="text-red-700">
                <strong>Required role:</strong> <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-700">writer</span>
              </p>
              <p className="text-red-600 text-xs mt-2">
                ⚠️ Note: Even administrators cannot access the writer panel
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default WriterRoute
