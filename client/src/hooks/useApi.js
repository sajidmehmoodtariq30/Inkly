import { useSelector } from 'react-redux'
import { selectToken } from '../redux/user/authSlice'
import authService from '../services/authService'

/**
 * Hook for making authenticated API calls
 * This hook automatically includes the Authorization header with the current token
 * and handles token refresh automatically
 */
export const useApi = () => {
  const token = useSelector(selectToken)

  const apiCall = async (url, options = {}) => {
    // For API calls to our backend, use the authService which handles token refresh
    if (url.includes(import.meta.env.VITE_API_BASE_URL)) {
      return authService.authenticatedFetch(url, options)
    }

    // For non-API calls, use regular fetch
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    }

    return fetch(url, defaultOptions)
  }

  // Convenience methods for different HTTP verbs
  const get = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' })
  }

  const post = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  const put = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  const del = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' })
  }

  const patch = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // For form data (file uploads)
  const postFormData = (url, formData, options = {}) => {
    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    delete headers['Content-Type']

    return apiCall(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    })
  }

  const putFormData = (url, formData, options = {}) => {
    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    delete headers['Content-Type']

    return apiCall(url, {
      ...options,
      method: 'PUT',
      headers,
      body: formData,
    })
  }

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
    patch,
    postFormData,
    putFormData,
  }
}

export default useApi
