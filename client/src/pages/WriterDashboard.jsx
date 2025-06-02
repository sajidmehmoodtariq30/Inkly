import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  PenTool, 
  FileText, 
  Eye, 
  Edit, 
  Clock, 
  Users, 
  TrendingUp,
  BookOpen,
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'

const WriterDashboard = () => {
  const { user } = useAuth()
  const { get } = useApi()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])
  const fetchDashboardData = async () => {
    try {      setLoading(true)
      setError(null)
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/dashboard`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setDashboardData(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not published'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <PenTool className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Writer Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.fullName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">No data available</h2>
        </div>
      </div>
    )
  }

  const { stats = {}, recentArticles = [], monthlyGoals = {} } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">            <div className="flex items-center">
              <PenTool className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Writer Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {dashboardData.user?.fullName || user?.fullName}</p>
              </div>
            </div>            <div className="flex items-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/writer/write">
                  <Edit className="w-4 h-4 mr-2" />
                  New Article
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles || 0}</div>              <p className="text-xs text-muted-foreground">
                {stats.publishedArticles || 0} published, {stats.draftArticles || 0} drafts{(stats.reviewArticles || 0) > 0 && `, ${stats.reviewArticles} in review`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalViews || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all published articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>              <div className="text-2xl font-bold">{stats.totalLikes || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalComments || 0} comments
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Articles */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Articles</CardTitle>                  <Button variant="outline" size="sm" asChild>
                    <Link to="/writer/articles">View All</Link>
                  </Button>
                </div>
                <CardDescription>
                  Your latest articles and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>                <div className="space-y-4">
                  {recentArticles && recentArticles.length > 0 ? (
                    recentArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{article.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(article.status)}`}>
                              {article.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {article.readingTime} min
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {article.views}
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {article.likes}
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {article.comments}
                            </div>
                            {article.publishedAt && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(article.publishedAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/writer/articles/${article.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No articles yet. Start writing your first article!</p>                      <Button className="mt-4" asChild>
                        <Link to="/writer/write">
                          <Edit className="w-4 h-4 mr-2" />
                          Create Article
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common writer tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/writer/write">
                    <Edit className="w-4 h-4 mr-2" />
                    Create New Article
                  </Link>
                </Button>                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/writer/drafts">
                    <FileText className="w-4 h-4 mr-2" />
                    Manage Drafts ({stats.draftArticles || 0})
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/writer/analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/writer/comments">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Manage Comments ({stats.totalComments || 0})
                  </Link>
                </Button>
              </CardContent>
            </Card>            {/* Writing Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
                <CardDescription>Track your writing progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Articles</span>
                      <span>{monthlyGoals.articlesPublished || 0}/{monthlyGoals.articlesTarget || 5}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(((monthlyGoals.articlesPublished || 0) / (monthlyGoals.articlesTarget || 5)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(monthlyGoals.articlesPublished || 0) >= (monthlyGoals.articlesTarget || 5)
                        ? '🎉 Goal achieved!' 
                        : `${(monthlyGoals.articlesTarget || 5) - (monthlyGoals.articlesPublished || 0)} more to reach your goal`
                      }
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Words Written</span>
                      <span>{(monthlyGoals.wordsWritten || 0).toLocaleString()}/{(monthlyGoals.wordsTarget || 20000).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(((monthlyGoals.wordsWritten || 0) / (monthlyGoals.wordsTarget || 20000)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(monthlyGoals.wordsWritten || 0) >= (monthlyGoals.wordsTarget || 20000)
                        ? '🎉 Goal achieved!' 
                        : `${((monthlyGoals.wordsTarget || 20000) - (monthlyGoals.wordsWritten || 0)).toLocaleString()} more words to reach your goal`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WriterDashboard
