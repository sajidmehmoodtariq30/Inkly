import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Calendar, 
  Plus, 
  Clock, 
  Edit, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'

const WriterSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week, day

  // Mock data - replace with real data later
  const scheduledContent = [
    {
      id: 1,
      title: "React Best Practices Guide",
      type: "article",
      status: "scheduled",
      publishDate: "2025-06-05T10:00:00Z",
      category: "Technology",
      estimatedReadTime: 8
    },
    {
      id: 2,
      title: "JavaScript ES2025 Features",
      type: "article",
      status: "draft",
      publishDate: "2025-06-07T14:00:00Z",
      category: "JavaScript",
      estimatedReadTime: 6
    },
    {
      id: 3,
      title: "Web Performance Optimization",
      type: "article",
      status: "scheduled",
      publishDate: "2025-06-10T09:00:00Z",
      category: "Web Development",
      estimatedReadTime: 12
    },
    {
      id: 4,
      title: "Node.js Security Best Practices",
      type: "article",
      status: "review",
      publishDate: "2025-06-12T11:00:00Z",
      category: "Backend",
      estimatedReadTime: 10
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'review':
        return 'bg-blue-100 text-blue-800'
      case 'published':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getCurrentMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getContentForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]
    
    return scheduledContent.filter(content => {
      const contentDate = new Date(content.publishDate).toISOString().split('T')[0]
      return contentDate === dateString
    })
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayContent = getContentForDate(day)
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
      
      days.push(
        <div key={day} className={`h-32 border border-gray-200 p-2 ${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayContent.map(content => (
              <div key={content.id} className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate">
                {content.title}
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return days
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your content</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Post
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {['month', 'week', 'day'].map((viewType) => (
            <Button
              key={viewType}
              variant={view === viewType ? 'default' : 'outline'}
              onClick={() => setView(viewType)}
              className="capitalize"
            >
              {viewType}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {getCurrentMonthName()}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Your content publishing schedule</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarGrid()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Content */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Content</CardTitle>
              <CardDescription>Next scheduled posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledContent
                .filter(content => new Date(content.publishDate) > new Date())
                .sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate))
                .slice(0, 5)
                .map(content => (
                  <div key={content.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {content.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(content.publishDate)}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{formatTime(content.publishDate)}</span>
                        </div>
                        <Badge className={`${getStatusColor(content.status)} text-xs mt-2`}>
                          {content.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Post
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Preview Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Publishing Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Scheduled</span>
                <span className="font-medium">
                  {scheduledContent.filter(c => c.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Review</span>
                <span className="font-medium">
                  {scheduledContent.filter(c => c.status === 'review').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Drafts</span>
                <span className="font-medium">
                  {scheduledContent.filter(c => c.status === 'draft').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WriterSchedule
