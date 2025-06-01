import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    // If authenticated, redirect to home page
    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    // If not authenticated, render the public component (login/register)
    return children
}

export default PublicRoute
