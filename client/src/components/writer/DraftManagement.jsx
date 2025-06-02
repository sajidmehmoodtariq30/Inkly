import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Clock, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  FileText,
  Send,
  Eye,
  Plus,
  Loader2,
  ArrowRight
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

const DraftManagement = () => {
  const { get, put, delete: del } = useApi()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [statusFilter, setStatusFilter] = useState('draft')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchDrafts()
  }, [statusFilter, sortBy, currentPage, searchTerm])

  const fetchDrafts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter
      })
      
      if (sortBy) {
        params.append('sort', sortBy)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/articles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch drafts')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.data.articles)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch drafts')
      }
    } catch (error) {
      console.error('Drafts fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (articleId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [articleId]: true }))
      
      const response = await put(`${import.meta.env.VITE_API_BASE_URL}writer/articles/${articleId}`, {
        status: newStatus
      })
      
      if (!response.ok) {
        throw new Error('Failed to update article status')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Article moved to ${newStatus}`)
        fetchDrafts() // Refresh the list
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update article status')
    } finally {
      setActionLoading(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const handleDeleteArticle = async (articleId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [articleId]: true }))
      
      const response = await del(`${import.meta.env.VITE_API_BASE_URL}writer/articles/${articleId}`)
      
      if (!response.ok) {
        throw new Error('Failed to delete article')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Article deleted successfully')
        fetchDrafts() // Refresh the list
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete article')
    } finally {
      setActionLoading(prev => ({ ...prev, [articleId]: false }))
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchDrafts()
  }

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading drafts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Draft Management</h2>
          <p className="text-muted-foreground">Manage your draft articles and move them through the publishing workflow</p>
        </div>
        <Button asChild>
          <Link to="/writer/write">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <Input
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="all">All Statuses</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="created">Recently Created</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchDrafts}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Articles List */}
      {articles.length === 0 && !loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first article'}
              </p>
              {!searchTerm && (
                <Button asChild className="mt-4">
                  <Link to="/writer/write">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">{article.title}</h3>
                      <Badge variant="secondary" className={getStatusColor(article.status)}>
                        {article.status}
                      </Badge>
                    </div>
                    
                    {article.excerpt && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Updated {formatDate(article.updatedAt)}</span>
                      </div>
                      {article.category && (
                        <div className="flex items-center gap-1">
                          <span>in</span>
                          <Badge variant="outline">{article.category.name}</Badge>
                        </div>
                      )}
                      {article.readingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {article.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(article.id, 'review')}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Submit for Review
                          </DropdownMenuItem>
                        )}
                        
                        {article.status === 'review' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(article.id, 'published')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Publish Now
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(article.id, 'draft')}
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Move to Draft
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalArticles)} of {pagination.totalArticles} articles
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
      

export default DraftManagement
