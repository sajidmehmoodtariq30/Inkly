import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { showTost } from '../utils/toast.js'
import GoogleLogin from "./GoogleLogin.jsx"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  avatar: z.instanceof(File, "Please select an avatar image")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export function RegisterForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    avatar: null
  })
  const [errors, setErrors] = useState({})
  const handleChange = (e) => {
    const { id, value, files } = e.target
    setFormData({
      ...formData,
      [id]: files ? files[0] : value
    })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      signupSchema.parse(formData)
      setErrors({})
      
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('email', formData.email)
      submitData.append('fullName', formData.fullName)
      submitData.append('username', formData.username)
      submitData.append('password', formData.password)
      submitData.append('avatar', formData.avatar)

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/register`, {
        method: "POST",
        body: submitData
      })
      const data = await response.json()
      if (!response.ok) {
        showTost(data.message, "error")
        return
      }
      navigate("/login", { replace: true })
      showTost(data.message, "success")


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

  return (
    <form className={cn("flex flex-col gap-2", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create a new account</h1>
        
      </div>
      <div className="grid gap-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>        <div className="grid gap-3">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="avatar">Profile Picture</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleChange}
            required
          />
          {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </div>
      <p className="text-center">Or</p>
      <div>
        <GoogleLogin />
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}
