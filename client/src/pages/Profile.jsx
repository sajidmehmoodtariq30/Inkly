import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../hooks/useAuth'
import { useAppDispatch } from '../redux/hooks'
import { updateUserProfile } from '../redux/user/authSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { UserIcon, Search, LogOut, Edit, Save, X, Upload, Camera, ImageIcon, Globe, MapPin, Briefcase, Calendar, Eye, EyeOff, Twitter, Linkedin, Github, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { showTost } from '../utils/toast'
import logo from '../assets/logo.png' // Adjust the path as necessary

const Profile = () => {
  const { user, logout } = useAuth()
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profession: user?.profession || '',
    profileVisibility: user?.preferences?.profileVisibility || 'public',
    emailNotifications: user?.preferences?.emailNotifications || true,
    pushNotifications: user?.preferences?.pushNotifications || true,
    newsletter: user?.preferences?.newsletter || false,
    // Social links
    twitterUrl: user?.socialLinks?.twitter || '',
    linkedinUrl: user?.socialLinks?.linkedin || '',
    githubUrl: user?.socialLinks?.github || '',
    websiteUrl: user?.socialLinks?.website || ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleLogout = () => {
    logout()
  }  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showTost('Please select an image file', 'error')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showTost('File size must be less than 5MB', 'error')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(file)
      showTost('Image selected successfully', 'success')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: !isEditing
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showTost('Please select an image file', 'error')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showTost('File size must be less than 5MB', 'error')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(file)
    }
  }
  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      fullName: user?.fullName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      location: user?.location || '',
      profession: user?.profession || '',
      profileVisibility: user?.preferences?.profileVisibility || 'public',
      emailNotifications: user?.preferences?.emailNotifications || true,
      pushNotifications: user?.preferences?.pushNotifications || true,
      newsletter: user?.preferences?.newsletter || false,
      // Social links
      twitterUrl: user?.socialLinks?.twitter || '',
      linkedinUrl: user?.socialLinks?.linkedin || '',
      githubUrl: user?.socialLinks?.github || '',
      websiteUrl: user?.socialLinks?.website || ''
    })
  }
  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setPreviewUrl(null)
    setFormData({
      fullName: user?.fullName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      location: user?.location || '',
      profession: user?.profession || '',
      profileVisibility: user?.preferences?.profileVisibility || 'public',
      emailNotifications: user?.preferences?.emailNotifications || true,
      pushNotifications: user?.preferences?.pushNotifications || true,
      newsletter: user?.preferences?.newsletter || false,
      // Social links
      twitterUrl: user?.socialLinks?.twitter || '',
      linkedinUrl: user?.socialLinks?.linkedin || '',
      githubUrl: user?.socialLinks?.github || '',
      websiteUrl: user?.socialLinks?.website || ''
    })
  }
  const handleSave = async () => {
    try {
      setIsLoading(true)
        const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('username', formData.username)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('location', formData.location)
      formDataToSend.append('profession', formData.profession)
      formDataToSend.append('profileVisibility', formData.profileVisibility)
      formDataToSend.append('emailNotifications', formData.emailNotifications)
      formDataToSend.append('pushNotifications', formData.pushNotifications)
      formDataToSend.append('newsletter', formData.newsletter)
      
      // Social links
      formDataToSend.append('twitterUrl', formData.twitterUrl)
      formDataToSend.append('linkedinUrl', formData.linkedinUrl)
      formDataToSend.append('githubUrl', formData.githubUrl)
      formDataToSend.append('websiteUrl', formData.websiteUrl)
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile)
        showTost('Uploading image...', 'info')
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      showTost('Profile updated successfully!', 'success')
      setIsEditing(false)
      setAvatarFile(null)
      setPreviewUrl(null)
      
      // Update user data in Redux store
      dispatch(updateUserProfile(data.data))
      
    } catch (error) {
      console.error('Profile update error:', error)
      showTost(error.message || 'Failed to update profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  className="h-24 w-auto"
                  src={logo} // Replace with your logo path
                  alt="Logo"
                />
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            {!isEditing ? (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                {isEditing ? 'Edit your account details' : 'Your account details'}
              </CardDescription>
            </CardHeader>            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  {isEditing ? (
                    <div 
                      {...getRootProps()} 
                      className={`w-24 h-24 rounded-full border-2 border-dashed cursor-pointer transition-all duration-200 ${
                        isDragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      } flex items-center justify-center relative overflow-hidden`}
                    >
                      <input {...getInputProps()} />
                      {(previewUrl || user?.avatar) ? (
                        <>
                          <img
                            src={previewUrl || user.avatar}
                            alt={user?.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="text-center">
                              <Camera className="w-5 h-5 text-white mx-auto mb-1" />
                              <p className="text-xs text-white">Change</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          {isDragActive ? (
                            <>
                              <Upload className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                              <p className="text-xs text-blue-600">Drop image here</p>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">Click or drag image</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                  )}
                    {isEditing && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 text-center">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        Max 5MB (JPG, PNG, GIF, WebP)
                      </p>                      {avatarFile && (
                        <div className="mt-2 flex justify-center">
                          <div className="text-center">
                            <p className="text-xs text-green-600 font-medium mb-1">
                              ✓ New image selected
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAvatarFile(null)
                                setPreviewUrl(null)
                              }}
                              className="text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{formData.fullName || user?.fullName || 'User'}</h2>
                  <p className="text-gray-600">@{formData.username || user?.username}</p>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.role && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user?.role === 'writer' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.fullName || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  {isEditing ? (
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                    />
                  ) : (
                    <p className="text-gray-900">@{user?.username || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                  {isEditing && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user?.role === 'writer' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
                  </span>
                  {isEditing && <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>}
                </div>                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.bio || 'No bio added yet'}</p>
                  )}
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  {isEditing ? (
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.location || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    Profession
                  </label>
                  {isEditing ? (
                    <Input
                      name="profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                      placeholder="Enter your profession"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.profession || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Profile Visibility
                  </label>
                  {isEditing ? (
                    <Select
                      value={formData.profileVisibility}
                      onValueChange={(value) => handleSelectChange('profileVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="followers">Followers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.preferences?.profileVisibility === 'public' ? 'bg-green-100 text-green-800' :
                      user?.preferences?.profileVisibility === 'private' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.preferences?.profileVisibility?.charAt(0).toUpperCase() + user?.preferences?.profileVisibility?.slice(1) || 'Public'}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </p>
                </div>              </div>
            </CardContent>
          </Card>

          {/* Social Links Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Links
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update your social media profiles' : 'Your social media profiles'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </label>
                  {isEditing ? (
                    <Input
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                    />
                  ) : (
                    user?.socialLinks?.twitter ? (
                      <a 
                        href={user.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {user.socialLinks.twitter}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <Input
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : (
                    user?.socialLinks?.linkedin ? (
                      <a 
                        href={user.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {user.socialLinks.linkedin}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Github className="w-4 h-4" />
                    GitHub
                  </label>
                  {isEditing ? (
                    <Input
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                    />
                  ) : (
                    user?.socialLinks?.github ? (
                      <a 
                        href={user.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {user.socialLinks.github}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Website
                  </label>
                  {isEditing ? (
                    <Input
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    user?.socialLinks?.website ? (
                      <a 
                        href={user.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {user.socialLinks.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                {isEditing ? 'Update your account preferences' : 'Your account preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.preferences?.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.preferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-500">Receive push notifications in browser</p>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={formData.pushNotifications}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.preferences?.pushNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.preferences?.pushNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Newsletter Subscription</label>
                    <p className="text-xs text-gray-500">Receive our weekly newsletter</p>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.preferences?.newsletter ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.preferences?.newsletter ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Section */}
          {!isEditing && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your activity and engagement overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{user?.totalPosts || 0}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user?.totalViews || 0}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{user?.totalLikes || 0}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{user?.followers || 0}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                </div>
                {user?.lastLogin && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Last login: {new Date(user.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
