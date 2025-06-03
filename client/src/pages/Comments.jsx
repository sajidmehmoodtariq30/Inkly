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

  // Mock data for now - replace with actual API call
  const mockComments = [
    {
      id: 1,
      content: "This is a fantastic article! The explanation of React hooks is very clear and the examples are practical. I've been struggling with useEffect and this really helped clarify things for me.",
      author: {
        name: "Alex Johnson",
        avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=6366f1&color=ffffff",
        role: "Developer"
      },
      article: {
        id: 1,
        title: "Getting Started with React Hooks",
        slug: "getting-started-with-react-hooks"
      },
      createdAt: "2024-03-15T10:30:00Z",
      likes: 12,
      replies: 3,
      status: "approved"
    },
    {
      id: 2,
      content: "Great tutorial on API development! One question though - how would you handle authentication in a production environment?",
      author: {
        name: "Sarah Davis",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Davis&background=8b5cf6&color=ffffff",
        role: "Student"
      },
      article: {
        id: 2,
        title: "Building Scalable APIs with Node.js",
        slug: "building-scalable-apis-with-nodejs"
      },
      createdAt: "2024-03-14T15:45:00Z",
      likes: 8,
      replies: 1,
      status: "approved"
    },
    {
      id: 3,
      content: "CSS Grid is amazing! I've been using Flexbox for everything but after reading this, I can see where Grid would be more appropriate. Thanks for the detailed comparison.",
      author: {
        name: "Mike Chen",
        avatar: "https://ui-avatars.com/api/?name=Mike+Chen&background=f59e0b&color=ffffff",
        role: "Designer"
      },
      article: {
        id: 3,
        title: "CSS Grid vs Flexbox: When to Use Which",
        slug: "css-grid-vs-flexbox-when-to-use-which"
      },
      createdAt: "2024-03-13T09:20:00Z",
      likes: 15,
      replies: 2,
      status: "approved"
    },
    {
      id: 4,
      content: "TypeScript has been a game-changer for our team. This article perfectly explains the benefits and migration strategies. Bookmarked for future reference!",
      author: {
        name: "Emily Rodriguez",
        avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ef4444&color=ffffff",
        role: "Team Lead"
      },
      article: {
        id: 4,
        title: "Introduction to TypeScript for JavaScript Developers",
        slug: "introduction-to-typescript-for-javascript-developers"
      },
      createdAt: "2024-03-12T14:10:00Z",
      likes: 20,
      replies: 5,
      status: "approved"
    },
    {
      id: 5,
      content: "Could you elaborate more on error handling? The article is great but I'd love to see more examples of edge cases.",
      author: {
        name: "David Kim",
        avatar: "https://ui-avatars.com/api/?name=David+Kim&background=10b981&color=ffffff",
        role: "Developer"
      },
      article: {
        id: 2,
        title: "Building Scalable APIs with Node.js",
        slug: "building-scalable-apis-with-nodejs"
      },
      createdAt: "2024-03-11T11:30:00Z",
      likes: 6,
      replies: 0,
      status: "pending"
    }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchComments = async () => {
      try {
        setLoading(true)
        // Replace this with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setComments(mockComments)
      } catch (err) {
        setError('Failed to fetch comments')
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [])

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return b.likes - a.likes
      case 'replies':
        return b.replies - a.replies
      default:
        return 0
    }
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{comment.author.name}</h3>
                      <p className="text-sm text-gray-500">{comment.author.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(comment.status)} variant="secondary">
                      {comment.status}
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
                      to={`/blog/${comment.article.id}`}
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
      )}

      {/* Load More Button */}
      {sortedComments.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline">
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  )
}

export default Comments
