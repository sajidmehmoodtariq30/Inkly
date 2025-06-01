import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../hooks/useAuth'
import { useAppDispatch } from '../redux/hooks'
import { updateUserProfile } from '../redux/user/authSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { UserIcon, Search, LogOut, Edit, Save, X, Upload, Camera, ImageIcon } from 'lucide-react'
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
    bio: user?.bio || ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleLogout = () => {
    logout()
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
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
      bio: user?.bio || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setPreviewUrl(null)
    setFormData({
      fullName: user?.fullName || '',
      username: user?.username || '',
      bio: user?.bio || ''
    })
  }
  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('username', formData.username)
      formDataToSend.append('bio', formData.bio)
      
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
                </div>
                <div className="md:col-span-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
