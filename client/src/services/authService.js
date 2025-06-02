import { store } from '../redux/store'
import { loginSuccess, setError } from '../redux/user/authSlice'

class AuthService {
  constructor() {
    this.refreshPromise = null
  }

  // Create an authenticated fetch wrapper
  async authenticatedFetch(url, options = {}) {
    const state = store.getState()
    const token = state.auth.token

    // Add authorization header if we have a token
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    }

    // First attempt with current token
    let response = await fetch(url, defaultOptions)

    // If we get a 401 and have a user (authenticated), try to refresh
    if (response.status === 401 && state.auth.user) {
      console.log('Token expired, attempting refresh...')
      
      try {
        const refreshResult = await this.refreshToken()
        
        if (refreshResult.success) {
          // Update the Authorization header with new token
          const newOptions = {
            ...defaultOptions,
            headers: {
              ...defaultOptions.headers,
              'Authorization': `Bearer ${refreshResult.accessToken}`
            }
          }
          
          // Retry the original request with new token
          response = await fetch(url, newOptions)
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.handleAuthFailure()
        return response
      }
    }

    return response
  }

  async refreshToken() {
    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  async performTokenRefresh() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies for refresh token
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Refresh token expired or invalid')
      }

      const data = await response.json()
      
      if (data.success && data.data.accessToken) {
        // Update the store with new token
        const state = store.getState()
        const currentUser = state.auth.user
        
        store.dispatch(loginSuccess({
          user: currentUser,
          token: data.data.accessToken
        }))

        console.log('Token refreshed successfully')
        return {
          success: true,
          accessToken: data.data.accessToken
        }
      } else {
        throw new Error('Invalid refresh response')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      this.handleAuthFailure()
      return { success: false, error: error.message }
    }
  }

  handleAuthFailure() {
    // Clear auth state
    store.dispatch(setError('Session expired. Please login again.'))
    
    // Clear local storage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    
    // Redirect to login page
    window.location.href = '/login'
  }

  // Method to manually trigger token refresh (can be called from components)
  async manualRefresh() {
    return this.refreshToken()
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService
