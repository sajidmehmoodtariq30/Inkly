import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  Users, 
  Tags, 
  MessageSquare, 
  Settings, 
  Home,
  Search,
  Bell,
  Menu,
  X,
  Shield,
  BarChart3,
  LogOut
} from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import OverviewPage from '../components/admin/OverviewPage'
import UserManagement from '../components/admin/UserManagement'
import CategoryManagement from '../components/admin/CategoryManagement'

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      component: <OverviewPage />
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      component: <UserManagement />
    },    {
      id: 'categories',
      label: 'Categories',
      icon: Tags,
      component: <CategoryManagement />
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageSquare,
      component: <CommentsPage />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: <AnalyticsPage />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      component: <SettingsPage />
    }
  ]

  const currentPage = sidebarItems.find(item => item.id === activePage)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex flex-col`}>
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Inkly" className="w-8 h-8" />
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Inkly Admin</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activePage === item.id 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Admin Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="w-full mt-3 flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{currentPage?.label}</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {currentPage?.component}
        </main>
      </div>
    </div>
  )
}

// Empty page components - structure only

const CommentsPage = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Comments Management</h3>
        <p className="text-gray-600">Review and moderate user comments</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline">Export</Button>
        <Button>Bulk Actions</Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>All Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search comments..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Flagged</option>
            </select>
          </div>
          
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Comment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Author</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Post</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No comments found. Comment moderation functionality will be implemented here.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

const AnalyticsPage = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold">Analytics</h3>
      <p className="text-gray-600">View platform statistics and insights</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Platform Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Analytics dashboard will be implemented here.</p>
      </CardContent>
    </Card>
  </div>
)

const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold">System Settings</h3>
      <p className="text-gray-600">Configure platform settings and preferences</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">System settings will be implemented here.</p>
      </CardContent>
    </Card>
  </div>
)

export default AdminDashboard
