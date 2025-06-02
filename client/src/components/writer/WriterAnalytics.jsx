import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageSquare, 
  Users, 
  Calendar,
  BarChart3,
  FileText,
  Clock,
  Loader2
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'

const WriterAnalytics = () => {
  const { get } = useApi()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalyticsData()
  }, [period])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/analytics?period=${period}`)
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">No analytics data available</h2>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your content performance and audience insights</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>          <CardContent>
            <div className="text-2xl font-bold">{(analyticsData?.overview?.totalViews || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all published articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview?.totalLikes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Reader engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview?.totalComments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Community discussions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Published</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview?.articlesPublished || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total published content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Read Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview?.averageReadTime || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Reader engagement depth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview?.engagementRate || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Likes & comments per view
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Last 7 days activity</CardDescription>
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              {(analyticsData?.recentPerformance && analyticsData.recentPerformance.length > 0) ? (
                analyticsData.recentPerformance.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-blue-500" />
                        {day.views}
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-red-500" />
                        {day.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-green-500" />
                        {day.comments}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Articles</CardTitle>
            <CardDescription>Based on engagement metrics</CardDescription>
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              {(analyticsData?.topArticles && analyticsData.topArticles.length > 0) ? (
                analyticsData.topArticles.map((article, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-blue-500" />
                        {article.views} views
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        {article.likes} likes
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                        {article.comments} comments
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                        {article.engagementRate}% engagement
                      </div>
                    </div>                    {article.category && (
                      <div className="mt-2">
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {typeof article.category === 'string' ? article.category : article.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No published articles yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      {analyticsData.categoryStats && analyticsData.categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>How your articles perform by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.categoryStats.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{category.categoryName}</span>
                    <p className="text-sm text-gray-500">{category.articleCount} articles</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-blue-500" />
                        {category.totalViews}
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-red-500" />
                        {category.totalLikes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audience Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Where your readers are from</CardDescription>
          </CardHeader>
          <CardContent>            <div className="space-y-3">
              {(analyticsData?.audienceInsights?.topCountries || []).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{country.country}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-10">{country.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>How readers access your content</CardDescription>
          </CardHeader>
          <CardContent>            <div className="space-y-3">
              {(analyticsData?.audienceInsights?.deviceTypes || []).map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{device.type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-10">{device.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WriterAnalytics
