import { configureStore } from '@reduxjs/toolkit'
import authReducer from './user/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types that might contain non-serializable values
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'auth/handleFirebaseAuthChange'
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.firebaseUser'],
      },
    }),
})
