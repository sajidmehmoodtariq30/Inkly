import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Globe } from 'lucide-react'
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from 'firebase/auth'
import { auth, provider } from '../utils/Firebase' // Adjust path as needed
import { useNavigate } from 'react-router-dom'
import { showTost } from '../utils/toast'
import { useAuth } from '../hooks/useAuth'

const GoogleLogin = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [redirectHandled, setRedirectHandled] = useState(false)
    
    // Helper function to extract serializable user data
    const extractUserData = (firebaseUser) => {
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            phoneNumber: firebaseUser.phoneNumber,
            providerId: firebaseUser.providerId
        }
    }
    
    // Handle redirect result when user returns from Google OAuth
    useEffect(() => {
        const handleRedirectResult = async () => {
            // Prevent multiple executions
            if (redirectHandled) return
            
            try {
                const result = await getRedirectResult(auth)
                if (result && result.user) {
                    setIsLoading(true)
                    setRedirectHandled(true)
                    
                    // Extract only serializable data
                    const userData = extractUserData(result.user)
                    
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/googleLogin`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: 'include', // Important for cookies
                        body: JSON.stringify({
                            email: result.user.email,
                            displayName: result.user.displayName,
                            photoURL: result.user.photoURL,
                            uid: result.user.uid
                        })
                    })

                    const data = await response.json()
                    if (!response.ok) {
                        showTost(data.message || "Authentication failed", "error")
                        setIsLoading(false)
                        return
                    }                    // Validate that we received proper authentication data
                    if (data.data && data.data.accessToken && data.data.user) {
                        // Use auth context to properly set user state
                        login(data.data.user, data.data.accessToken)
                        
                        showTost(data.message || "Login successful", "success")
                        
                        // Small delay to ensure cookies are set
                        setTimeout(() => {
                            navigate("/", { replace: true })
                        }, 100)
                    } else {
                        showTost("Authentication failed - incomplete response", "error")
                        setIsLoading(false)
                    }
                } else {
                    setRedirectHandled(true)
                }
            } catch (error) {
                console.error('Error handling redirect result:', error)
                showTost('Failed to complete Google sign in. Please try again.', 'error')
                setRedirectHandled(true)
                setIsLoading(false)
            }
        }

        handleRedirectResult()
    }, [navigate, redirectHandled])
    const handleGoogleLogin = async () => {
        if (isLoading) return // Prevent multiple clicks
        
        try {
            setIsLoading(true)
            let result;
            
            try {
                // Try popup first
                result = await signInWithPopup(auth, provider)
            } catch (popupError) {
                console.log('Popup blocked or CORS issue, trying redirect...', popupError)
                setIsLoading(false)
                // If popup fails (due to CORS or popup blockers), use redirect
                await signInWithRedirect(auth, provider)
                return; // Redirect will handle the flow
            }

            if (!result || !result.user) {
                setIsLoading(false)
                return
            }

            // Send authentication data to server
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/googleLogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    uid: result.user.uid
                })
            })

            const data = await response.json()
            if (!response.ok) {
                showTost(data.message || "Authentication failed", "error")
                setIsLoading(false)
                return
            }            // Validate that we received proper authentication data
            if (data.data && data.data.accessToken && data.data.user) {
                // Use auth context to properly set user state
                login(data.data.user, data.data.accessToken)
                
                showTost(data.message || "Login successful", "success")
                
                // Small delay to ensure cookies are set and state is updated
                setTimeout(() => {
                    navigate("/", { replace: true })
                }, 100)
            } else {
                showTost("Authentication failed - incomplete response", "error")
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error signing in with Google:', error)
            showTost('Failed to sign in with Google. Please try again.', 'error')
            setIsLoading(false)        }
    }

    return (
        <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={isLoading}
        >
            <Globe />
            {isLoading ? "Signing in..." : "Sign in with Google"}
        </Button>
    )
}

export default GoogleLogin