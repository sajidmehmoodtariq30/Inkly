import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { Globe } from 'lucide-react'
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from 'firebase/auth'
import { auth, provider } from '../utils/Firebase' // Adjust path as needed
import { useNavigate } from 'react-router-dom'
import { showTost } from '../utils/toast'

const GoogleLogin = () => {
    const navigate = useNavigate()
    
    // Handle redirect result when user returns from Google OAuth
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth)
                if (result) {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/googleLogin`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: result.user.email,
                            displayName: result.user.displayName,
                            photoURL: result.user.photoURL,
                            uid: result.user.uid
                        })
                    })

                    const data = await response.json()
                    if (!response.ok) {
                        showTost(data.message, "error")
                        return
                    }

                    navigate("/", { replace: true })
                    showTost(data.message || "Login successful", "success")
                }
            } catch (error) {
                console.error('Error handling redirect result:', error)
                showTost('Failed to complete Google sign in. Please try again.', 'error')
            }
        }

        handleRedirectResult()
    }, [navigate])
    
      const handleGoogleLogin = async () => {
        try {
            let result;
            try {
                // Try popup first
                result = await signInWithPopup(auth, provider)
            } catch (popupError) {
                console.log('Popup blocked or CORS issue, trying redirect...', popupError)
                // If popup fails (due to CORS or popup blockers), use redirect
                await signInWithRedirect(auth, provider)
                return; // Redirect will handle the flow
            }

            if (!result) return;

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/googleLogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    uid: result.user.uid
                })
            })

            const data = await response.json()
            if (!response.ok) {
                showTost(data.message, "error")
                return
            }

            // Store tokens if needed (you might want to use a context or localStorage)
            navigate("/", { replace: true })
            showTost(data.message || "Login successful", "success")
        } catch (error) {
            console.error('Error signing in with Google:', error)
            showTost('Failed to sign in with Google. Please try again.', 'error')
        }
    }

    return (
        <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center gap-2"
        >
            <Globe />
            Sign in with Google
        </Button>
    )
}

export default GoogleLogin