import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../utils/Firebase'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { 
  selectUser, 
  selectToken,
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectAuthError,
  loginSuccess, 
  logoutAsync,
  setLoading,
  handleFirebaseAuthChange
} from '../redux/user/authSlice'

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

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const token = useAppSelector(selectToken)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  useEffect(() => {
    // Note: Firebase auth state listener is disabled for regular login
    // It's only used in GoogleLogin component for Google authentication
    // This prevents conflicts between Firebase auth and backend auth
    
    // Uncomment this if you want Firebase auth state management:
    // const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    //   const serializableUserData = extractUserData(firebaseUser)
    //   dispatch(handleFirebaseAuthChange(serializableUserData))
    // })
    // return () => unsubscribe()
  }, [dispatch])

  const login = (userData, token) => {
    dispatch(loginSuccess({ user: userData, token }))
  }

  const logout = async () => {
    return dispatch(logoutAsync()).unwrap()
  }

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  }
}
