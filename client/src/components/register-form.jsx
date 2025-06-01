import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
  avatar: z.instanceof(File, "Please select an avatar image"),
  // Optional fields
  bio: z.string().optional(),
  location: z.string().optional(),
  profession: z.string().optional(),
  newsletter: z.boolean().default(false),
  profileVisibility: z.enum(['public', 'private']).default('public'),
  // Social links
  twitterUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  websiteUrl: z.string().optional()
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
    avatar: null,
    // Optional fields
    bio: "",
    location: "",
    profession: "",
    newsletter: false,    profileVisibility: "public",
    // Social links
    twitterUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: ""
  })
  const [errors, setErrors] = useState({})
  const [showOptional, setShowOptional] = useState(false)
  
  const handleChange = (e) => {
    const { id, value, files, type, checked } = e.target
    setFormData({
      ...formData,
      [id]: files ? files[0] : type === 'checkbox' ? checked : value
    })
  }
  
  const handleSelectChange = (id, value) => {
    setFormData({
      ...formData,
      [id]: value
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
      
      // Add optional fields
      if (formData.bio) submitData.append('bio', formData.bio)
      if (formData.location) submitData.append('location', formData.location)
      if (formData.profession) submitData.append('profession', formData.profession)
      submitData.append('newsletter', formData.newsletter)
      submitData.append('profileVisibility', formData.profileVisibility)
      
      // Add social links
      if (formData.twitterUrl) submitData.append('twitterUrl', formData.twitterUrl)
      if (formData.linkedinUrl) submitData.append('linkedinUrl', formData.linkedinUrl)
      if (formData.githubUrl) submitData.append('githubUrl', formData.githubUrl)
      if (formData.websiteUrl) submitData.append('websiteUrl', formData.websiteUrl)

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
        </div>        <div className="grid gap-3">
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
        
        {/* Optional Fields Toggle */}
        <div className="flex items-center justify-center">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setShowOptional(!showOptional)}
            className="text-sm"
          >
            {showOptional ? 'Hide Optional Fields' : 'Add Optional Information'}
          </Button>
        </div>
        
        {showOptional && (
          <>
            {/* Bio */}
            <div className="grid gap-3">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
                rows={3}
              />
              {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
            </div>
            
            {/* Location and Profession */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
              </div>
              <div>
                <Label htmlFor="profession">Profession (Optional)</Label>
                <Input
                  id="profession"
                  type="text"
                  placeholder="Your profession"
                  value={formData.profession}
                  onChange={handleChange}
                />
                {errors.profession && <p className="text-red-500 text-sm">{errors.profession}</p>}
              </div>
            </div>
            
            {/* Profile Visibility */}
            <div className="grid gap-3">
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <Select value={formData.profileVisibility} onValueChange={(value) => handleSelectChange('profileVisibility', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              {errors.profileVisibility && <p className="text-red-500 text-sm">{errors.profileVisibility}</p>}
            </div>
            
            {/* Social Links */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Social Links (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="twitterUrl" className="text-xs">Twitter</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    placeholder="https://twitter.com/username"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinUrl" className="text-xs">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="githubUrl" className="text-xs">GitHub</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.githubUrl}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl" className="text-xs">Website</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Newsletter Subscription */}
            <div className="flex items-center space-x-2">
              <input
                id="newsletter"
                type="checkbox"
                checked={formData.newsletter}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="newsletter" className="text-sm">
                Subscribe to our newsletter for updates and tips
              </Label>
            </div>
          </>
        )}
        
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
