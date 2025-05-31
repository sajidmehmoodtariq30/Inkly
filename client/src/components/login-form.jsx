import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { showTost } from '../utils/toast.js'

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export function LoginForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ emailOrUsername: "", password: "" })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      loginSchema.parse(formData)
      setErrors({})
      
      // Prepare data for API call
      const loginData = {
        password: formData.password
      }
      
      // Check if input is email or username
      if (formData.emailOrUsername.includes('@')) {
        loginData.email = formData.emailOrUsername
      } else {
        loginData.username = formData.emailOrUsername
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
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
      if (error instanceof z.ZodError) {
        const fieldErrors = {}
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      }
    }
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>        <p className="text-muted-foreground text-sm text-balance">
          Enter your email or username below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="emailOrUsername">Email or Username</Label>
          <Input 
            id="emailOrUsername" 
            name="emailOrUsername"
            type="text" 
            placeholder="Email or username" 
            value={formData.emailOrUsername}
            onChange={handleChange}
            required 
          />
          {errors.emailOrUsername && <p className="text-red-500 text-sm">{errors.emailOrUsername}</p>}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
