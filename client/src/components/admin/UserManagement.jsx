import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  User,
  PenTool
} from 'lucide-react'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [banningUser, setBanningUser] = useState(null)

  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, selectedRole, selectedStatus])
  const fetchUsers = async () => {
    try {
      setLoading(true)
        const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole !== 'all' && { role: selectedRole }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      })

      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const response = await fetch(`/api/v1/admin/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.data.users)
      setTotalPages(data.data.pagination.totalPages)
      setTotalUsers(data.data.pagination.totalUsers)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleRoleFilter = (role) => {
    setSelectedRole(role)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user._id))
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleBanUser = (user) => {
    setBanningUser(user)
    setShowBanModal(true)
  }
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      // Refresh users list
      fetchUsers()
    } catch (err) {
      console.error('Error updating user role:', err)
      // Add toast notification here
    }
  }
  const handleBanUserSubmit = async (banned, reason = '') => {
    try {
      const response = await fetch(`/api/v1/admin/users/${banningUser._id}/ban`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ banned, reason })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${banned ? 'ban' : 'unban'} user`)
      }

      setShowBanModal(false)
      setBanningUser(null)
      fetchUsers()
    } catch (err) {
      console.error(`Error ${banned ? 'banning' : 'unbanning'} user:`, err)
      // Add toast notification here
    }
  }

  const handleExportUsers = async () => {
    try {
      // Create CSV content
      const csvHeader = 'Name,Username,Email,Role,Status,Join Date\n'
      const csvRows = users.map(user => {
        const status = user.banned ? 'Banned' : 'Active'
        const joinDate = new Date(user.createdAt).toLocaleDateString()
        return `"${user.fullName}","${user.username}","${user.email}","${user.role}","${status}","${joinDate}"`
      }).join('\n')
      
      const csvContent = csvHeader + csvRows
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting users:', err)
    }
  }

  const handleAddNewUser = () => {
    setShowAddUserModal(true)
  }

  const handleAddUserSubmit = async (userData) => {
    try {
      const response = await fetch('/api/v1/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      setShowAddUserModal(false)
      fetchUsers()
    } catch (err) {
      console.error('Error creating user:', err)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-600" />
      case 'writer': return <PenTool className="w-4 h-4 text-blue-600" />
      default: return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'writer': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">User Management</h3>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading users</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <Button 
                onClick={fetchUsers}
                className="mt-2"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-gray-600">Manage users, roles, and permissions ({totalUsers} total users)</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportUsers}>
            Export Users
          </Button>
          <Button onClick={handleAddNewUser}>
            Add New User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select 
              value={selectedRole}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="writer">Writer</option>
              <option value="user">User</option>
            </select>

            {/* Status Filter */}
            <select 
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Users</span>
            {selectedUsers.length > 0 && (
              <span className="text-sm font-normal text-gray-600">
                {selectedUsers.length} selected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || '/default-avatar.png'}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                          className={`inline-flex px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(user.role)}`}
                        >
                          <option value="user">User</option>
                          <option value="writer">Writer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        user.banned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBanUser(user)}
                          className={user.banned ? 'text-green-600' : 'text-red-600'}
                        >
                          {user.banned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
                <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (pageNum > totalPages) return null
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban/Unban Modal */}
      {showBanModal && banningUser && (
        <BanUserModal
          user={banningUser}
          onClose={() => {
            setShowBanModal(false)
            setBanningUser(null)
          }}
          onConfirm={handleBanUserSubmit}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUserSubmit}
        />
      )}
    </div>
  )
}

// Ban User Modal Component
const BanUserModal = ({ user, onClose, onConfirm }) => {
  const [reason, setReason] = useState('')
  
  const handleBan = () => {
    onConfirm(true, reason)
  }
  
  const handleUnban = () => {
    onConfirm(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {user.banned ? 'Unban User' : 'Ban User'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.fullName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{user.fullName}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
          
          {!user.banned && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for ban (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for banning this user..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          )}
          
          {user.banned && user.banReason && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current ban reason:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{user.banReason}</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {user.banned ? (
            <Button onClick={handleUnban} className="flex-1 bg-green-600 hover:bg-green-700">
              Unban User
            </Button>
          ) : (
            <Button onClick={handleBan} className="flex-1 bg-red-600 hover:bg-red-700">
              Ban User
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Add User Modal Component
const AddUserModal = ({ onClose, onSubmit }) => {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName || !username || !email || !role || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await onSubmit({ fullName, username, email, role, password })
      setSuccess('User added successfully')
      setFullName('')
      setUsername('')
      setEmail('')
      setRole('user')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('Failed to add user')
      console.error('Error adding user:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Add New User
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="writer">Writer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserManagement
