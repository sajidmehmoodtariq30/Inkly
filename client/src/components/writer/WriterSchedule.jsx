import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Calendar, 
  Plus, 
  Clock, 
  Edit, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { toast } from '../../utils/toast'

const WriterSchedule = () => {
  const { get, put } = useApi()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week, day
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchScheduledContent()
  }, [currentDate, view])

  const fetchScheduledContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get articles with scheduled publish dates or in review status
      const params = new URLSearchParams({
        limit: '50',
        status: 'review,scheduled',
        sort: 'publishedAt'
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/articles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled content')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.data.articles)
      } else {
        throw new Error(data.message || 'Failed to fetch scheduled content')
      }
    } catch (error) {
      console.error('Scheduled content fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleUpdate = async (articleId, newStatus, publishDate = null) => {
    try {
      setActionLoading(prev => ({ ...prev, [articleId]: true }))
      
      const updateData = { status: newStatus }
      if (publishDate) {
        updateData.publishedAt = publishDate
      }
      
      const response = await put(`${import.meta.env.VITE_API_BASE_URL}writer/articles/${articleId}`, updateData)
      
      if (!response.ok) {
        throw new Error('Failed to update schedule')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Schedule updated successfully')
        fetchScheduledContent() // Refresh the list
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update schedule')
    } finally {
      setActionLoading(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'review': return <AlertTriangle className="w-4 h-4" />
      case 'published': return <CheckCircle className="w-4 h-4" />
      default: return <Edit className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled'
    
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const isOverdue = (publishDate) => {
    if (!publishDate) return false
    return new Date(publishDate) < new Date()
  }

  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      
      const dayArticles = articles.filter(article => {
        if (!article.publishedAt) return false
        const articleDate = new Date(article.publishedAt)
        return articleDate.toDateString() === day.toDateString()
      })
      
      days.push({
        date: day,
        isCurrentMonth: day.getMonth() === month,
        isToday: day.toDateString() === new Date().toDateString(),
        articles: dayArticles
      })
    }
    
    return days
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchScheduledContent()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading schedule...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Content Schedule</h2>
          <p className="text-muted-foreground">Manage your publishing schedule and upcoming content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setView(view === 'month' ? 'list' : 'month')}>
            {view === 'month' ? 'List View' : 'Calendar View'}
          </Button>
          <Button asChild>
            <Link to="/writer/write">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchScheduledContent}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {view === 'month' ? (
        /* Calendar View */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border rounded-lg transition-colors
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${day.isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.articles.slice(0, 2).map(article => (
                      <div
                        key={article.id}
                        className={`
                          text-xs p-1 rounded truncate
                          ${article.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}
                          ${isOverdue(article.publishedAt) ? 'bg-red-100 text-red-800' : ''}
                        `}
                        title={article.title}
                      >
                        {article.title}
                      </div>
                    ))}
                    {day.articles.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{day.articles.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-4">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled content</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Schedule your articles for future publication to maintain a consistent posting schedule.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/writer/write">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Article
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            articles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{article.title}</h3>
                        <Badge variant="secondary" className={getStatusColor(article.status)}>
                          {getStatusIcon(article.status)}
                          <span className="ml-1">{article.status}</span>
                        </Badge>
                        {isOverdue(article.publishedAt) && (
                          <Badge variant="destructive">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        {article.category && (
                          <div className="flex items-center gap-1">
                            <span>in</span>
                            <Badge variant="outline">{article.category.name}</Badge>
                          </div>
                        )}
                        {article.readingTime && (
                          <div className="flex items-center gap-1">
                            <span>{article.readingTime} min read</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/writer/edit/${article.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={actionLoading[article.id]}
                          >
                            {actionLoading[article.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Schedule Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {article.status === 'review' && (
                            <DropdownMenuItem
                              onClick={() => handleScheduleUpdate(article.id, 'published')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish Now
                            </DropdownMenuItem>
                          )}
                          
                          {article.status === 'scheduled' && (
                            <DropdownMenuItem
                              onClick={() => handleScheduleUpdate(article.id, 'draft')}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Move to Draft
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => handleScheduleUpdate(article.id, 'review')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Submit for Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default WriterSchedule
