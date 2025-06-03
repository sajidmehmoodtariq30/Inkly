import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Search, 
  MessageSquare, 
  User, 
  Calendar,
  ThumbsUp,
  Reply,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Comments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  // Fetch comments from published articles
  const fetchComments = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true)
      }
      setError(null)

      // Fetch published articles with their comments
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/articles?page=${page}&limit=20&sortBy=publishedAt`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }

      const data = await response.json()
      
      if (data.success && data.data.articles) {
        // Extract all approved comments from articles
        const allComments = []
        
        data.data.articles.forEach(article => {
          if (article.comments && article.comments.length > 0) {
            // Add article context to each comment
            article.comments.forEach(comment => {
              if (comment.isApproved) {
                allComments.push({
                  id: comment.id,
                  content: comment.content,
                  author: {
                    name: comment.user?.fullName || 'Anonymous',
                    avatar: comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.fullName || 'Anonymous')}&background=6366f1&color=ffffff`,
                    role: 'Reader' // Default role for public comments
                  },
                  article: {
                    id: article.id,
                    title: article.title,
                    slug: article.slug
                  },
                  createdAt: comment.createdAt,
                  likes: 0, // Comments don't have likes in the current model
                  replies: 0, // Comments don't have replies in the current model
                  status: 'approved'
                })
              }
            })
          }
        })

        if (append) {
          setComments(prev => [...prev, ...allComments])
        } else {
          setComments(allComments)
        }

        // Check if there are more pages
        setHasMore(data.data.pagination.hasNextPage)
        setCurrentPage(page)
      } else {
        throw new Error(data.message || 'Failed to fetch comments')
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError('Failed to fetch comments. Please try again.')
    } finally {
      if (!append) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])
  const filteredComments = comments.filter(comment => {
    if (!comment || !comment.content || !comment.author || !comment.article) {
      return false
    }
    
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.article.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const sortedComments = [...filteredComments].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'popular':
        return (b.likes || 0) - (a.likes || 0)
      case 'replies':
        return (b.replies || 0) - (a.replies || 0)
      default:
        return 0
    }
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchComments(currentPage + 1, true)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Recent Comments</h1>
        <p className="text-gray-600">Join the conversation and see what our community is discussing</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Liked</option>
            <option value="replies">Most Replies</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {sortedComments.length} of {comments.length} comments
        </p>
      </div>

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No comments found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">                  <div className="flex items-center gap-3">
                    <img
                      src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'Anonymous')}&background=6366f1&color=ffffff`}
                      alt={comment.author?.name || 'Anonymous'}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'Anonymous')}&background=6366f1&color=ffffff`
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{comment.author?.name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">{comment.author?.role || 'Reader'}</p>
                    </div>
                  </div>                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(comment.status || 'approved')} variant="secondary">
                      {comment.status || 'approved'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Comment content */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                </div>

                {/* Article reference */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Comment on:</p>
                      <h4 className="font-medium text-gray-900">{comment.article.title}</h4>
                    </div>
                    <Link
                      to={`/article/${comment.article.id}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Article
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Comment stats and actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{comment.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Reply className="h-4 w-4" />
                      <span>{comment.replies} replies</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Like
                    </Button>
                    <Button variant="outline" size="sm">
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}      {/* Load More Button */}
      {sortedComments.length > 0 && hasMore && (
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Comments'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Comments
