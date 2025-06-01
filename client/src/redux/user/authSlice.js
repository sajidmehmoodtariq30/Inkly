import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { signOut } from 'firebase/auth'
import { auth } from '../../utils/Firebase'

// Helper function to extract serializable user data
const extractUserData = (firebaseUser) => {
  if (!firebaseUser) return null
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    phoneNumber: firebaseUser.phoneNumber,
    providerId: firebaseUser.providerId,
    metadata: {
      creationTime: firebaseUser.metadata?.creationTime,
      lastSignInTime: firebaseUser.metadata?.lastSignInTime
    }
  }
}

// Async thunk for logout
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Sign out from Firebase
      await signOut(auth)
      
      // Call logout API to clear server-side cookies
      await fetch(`${import.meta.env.VITE_API_BASE_URL}users/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      
      // Clear local storage
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      
      return null
    } catch (error) {
      console.error('Logout error:', error)
      return rejectWithValue(error.message)
    }
  }
)

// Check for stored authentication data
const getStoredAuth = () => {
  try {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    
    if (storedUser && storedToken) {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true
      }
    }
  } catch (error) {
    console.error('Error parsing stored user data:', error)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false
  }
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  ...getStoredAuth()
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {    loginSuccess: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('accessToken', token)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
    updateUserProfile: (state, action) => {
      const updatedUser = action.payload
      state.user = { ...state.user, ...updatedUser }
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    // Handle Firebase auth state changes with serializable data
    handleFirebaseAuthChange: (state, action) => {
      const firebaseUser = action.payload
      
      // This is mainly used for Google login
      // For regular email/password login, we don't use Firebase auth
      if (firebaseUser) {
        // Firebase user signed in (Google login)
        state.user = firebaseUser
        state.isAuthenticated = true
        state.loading = false
        state.error = null
      } else if (!firebaseUser && state.user && state.user.providerId) {
        // Firebase user signed out (only clear if it was a Firebase user)
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Still clear the user data even if logout API fails
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
      })
  }
})

export const { 
  loginSuccess, 
  setLoading, 
  setError, 
  clearError, 
  updateUserProfile,
  handleFirebaseAuthChange 
} = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
