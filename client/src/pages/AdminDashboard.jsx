import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  Users, 
  Tags, 
  MessageSquare, 
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
import { useAuth } from '../hooks/useAuth'

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuth()
  
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
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
          </div>          {sidebarOpen && (
            <button 
              onClick={handleLogout}
              className="w-full mt-3 flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
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

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [error, setError] = useState(null)  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('accessToken')
      console.log('Token found:', token ? 'Yes' : 'No')
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts or period changes
  React.useEffect(() => {
    fetchAnalyticsData()
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-900">No analytics data available</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Platform Analytics</h3>
          <p className="text-gray-600">Monitor platform performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="period" className="text-sm font-medium text-gray-700">Time Period:</label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600">+{analyticsData.overview.newUsersThisMonth} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Writers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalWriters}</div>
            <p className="text-xs text-muted-foreground">Content creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Content engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Content appreciation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5%</div>
            <p className="text-xs text-green-600">+0.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-gray-600">Last 7 days platform activity</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">{day.users} users</span>
                    <span className="text-green-600">{day.articles} articles</span>
                    <span className="text-purple-600">{day.comments} comments</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <p className="text-sm text-gray-600">Most popular content categories</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.articles} articles</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{category.views.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">views</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Writers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Writers</CardTitle>
          <p className="text-sm text-gray-600">Writers with highest engagement</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Writer</th>
                  <th className="text-right py-2">Articles</th>
                  <th className="text-right py-2">Views</th>
                  <th className="text-right py-2">Likes</th>
                  <th className="text-right py-2">Avg. Views/Article</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topWriters.map((writer, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{writer.name}</td>
                    <td className="text-right py-2">{writer.articles}</td>
                    <td className="text-right py-2">{writer.views.toLocaleString()}</td>
                    <td className="text-right py-2">{writer.likes}</td>
                    <td className="text-right py-2">{Math.round(writer.views / writer.articles)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
