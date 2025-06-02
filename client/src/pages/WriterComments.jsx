import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  MessageSquare, 
  Clock, 
  User,
  Search,
  Filter,
  Check,
  X,
  Reply,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApi } from '../hooks/useApi'
import { toast } from '../utils/toast'

const WriterComments = () => {
  const { get, put, delete: del } = useApi()
  const [articles, setArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    if (selectedArticle) {
      fetchComments()
    }
  }, [selectedArticle, statusFilter, currentPage])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/articles?limit=100&status=published`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const data = await response.json()
      
      if (data.success) {
        const articlesWithComments = data.data.articles.filter(article => 
          article.comments > 0
        )
        setArticles(articlesWithComments)
        
        if (articlesWithComments.length > 0 && !selectedArticle) {
          setSelectedArticle(articlesWithComments[0])
        }
      } else {
        throw new Error(data.message || 'Failed to fetch articles')
      }
    } catch (error) {
      console.error('Articles fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!selectedArticle) return
    
    try {
      setCommentsLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/articles/${selectedArticle.id}/comments?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setComments(data.data.comments)
        setPagination(data.data.pagination)
        setStats({
          total: data.data.article.totalComments,
          approved: data.data.article.approvedComments,
          pending: data.data.article.pendingComments
        })
      } else {
        throw new Error(data.message || 'Failed to fetch comments')
      }
    } catch (error) {
      console.error('Comments fetch error:', error)
      toast.error(error.message)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleApproveComment = async (commentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }))
      
      const response = await put(`${import.meta.env.VITE_API_BASE_URL}writer/comments/${commentId}/approve`)
      
      if (!response.ok) {
        throw new Error('Failed to approve comment')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Comment approved successfully')
        fetchComments() // Refresh comments
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to approve comment')
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }))
      
      const response = await del(`${import.meta.env.VITE_API_BASE_URL}writer/comments/${commentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Comment deleted successfully')
        fetchComments() // Refresh comments
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete comment')
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading comments...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchArticles}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comments will appear here once readers start engaging with your published articles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Comment Management</h1>
        <p className="text-muted-foreground">Manage comments on your published articles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Article Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Articles</CardTitle>
            <CardDescription>Select an article to view its comments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {articles.map((article) => (
              <Button
                key={article.id}
                variant={selectedArticle?.id === article.id ? "default" : "ghost"}
                className="w-full justify-start h-auto p-3"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="text-left">
                  <div className="font-medium text-sm truncate">{article.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {article.comments} comment{article.comments !== 1 ? 's' : ''}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="lg:col-span-3 space-y-6">
          {selectedArticle && (
            <>
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Comments</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              {commentsLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading comments...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : comments.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium">No comments found</h3>
                      <p className="text-sm text-muted-foreground">
                        {statusFilter === 'all' 
                          ? 'This article doesn\'t have any comments yet.'
                          : `No ${statusFilter} comments found.`
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {comment.user.avatar ? (
                              <img
                                src={comment.user.avatar}
                                alt={comment.user.fullName}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                {getInitials(comment.user.fullName)}
                              </div>
                            )}
                          </div>

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{comment.user.fullName}</h4>
                                <Badge 
                                  variant={comment.isApproved ? "default" : "secondary"}
                                  className={comment.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                                >
                                  {comment.isApproved ? 'Approved' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      disabled={actionLoading[comment.id]}
                                    >
                                      {actionLoading[comment.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {!comment.isApproved && (
                                      <DropdownMenuItem
                                        onClick={() => handleApproveComment(comment.id)}
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalComments)} of {pagination.totalComments} comments
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={!pagination.hasPrevPage || commentsLoading}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={!pagination.hasNextPage || commentsLoading}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}



export default WriterComments
