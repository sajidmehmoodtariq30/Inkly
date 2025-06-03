import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Search, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  MessageSquare,
  Clock,
  Filter
} from 'lucide-react'
import { Link } from 'react-router-dom'

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [error, setError] = useState(null)

  // Mock data for now - replace with actual API call
  const mockBlogs = [
    {
      id: 1,
      title: "Getting Started with React Hooks",
      excerpt: "Learn the fundamentals of React Hooks and how they can simplify your component logic...",
      author: {
        name: "John Doe",
        avatar: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=ffffff"
      },
      publishedAt: "2024-03-15",
      readTime: "5 min read",
      category: "React",
      tags: ["React", "JavaScript", "Hooks"],
      views: 1250,
      likes: 45,
      comments: 12,
      featured: true,
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Building Scalable APIs with Node.js",
      excerpt: "A comprehensive guide to creating robust and scalable APIs using Node.js and Express...",
      author: {
        name: "Sarah Chen",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=8b5cf6&color=ffffff"
      },
      publishedAt: "2024-03-12",
      readTime: "8 min read",
      category: "Backend",
      tags: ["Node.js", "API", "Backend"],
      views: 890,
      likes: 67,
      comments: 23,
      featured: false,
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop"
    },
    {
      id: 3,
      title: "CSS Grid vs Flexbox: When to Use Which",
      excerpt: "Understanding the differences between CSS Grid and Flexbox and when to use each layout method...",
      author: {
        name: "Alex Rodriguez",
        avatar: "https://ui-avatars.com/api/?name=Alex+Rodriguez&background=f59e0b&color=ffffff"
      },
      publishedAt: "2024-03-10",
      readTime: "6 min read",
      category: "CSS",
      tags: ["CSS", "Layout", "Grid", "Flexbox"],
      views: 2100,
      likes: 89,
      comments: 34,
      featured: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Introduction to TypeScript for JavaScript Developers",
      excerpt: "Make the transition from JavaScript to TypeScript with this beginner-friendly guide...",
      author: {
        name: "Emma Wilson",
        avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=ef4444&color=ffffff"
      },
      publishedAt: "2024-03-08",
      readTime: "7 min read",
      category: "TypeScript",
      tags: ["TypeScript", "JavaScript", "Programming"],
      views: 1675,
      likes: 78,
      comments: 19,
      featured: false,
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop"
    }
  ]

  const categories = ["all", "React", "Backend", "CSS", "TypeScript", "JavaScript"]

  useEffect(() => {
    // Simulate API call
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        // Replace this with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setBlogs(mockBlogs)
      } catch (err) {
        setError('Failed to fetch blogs')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.publishedAt) - new Date(a.publishedAt)
      case 'oldest':
        return new Date(a.publishedAt) - new Date(b.publishedAt)
      case 'popular':
        return b.views - a.views
      case 'liked':
        return b.likes - a.likes
      default:
        return 0
    }
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading blogs...</p>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">All Blogs</h1>
        <p className="text-gray-600">Discover amazing articles from our community of writers</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category and Sort filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most Viewed</option>
              <option value="liked">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {sortedBlogs.length} of {blogs.length} blogs
        </p>
      </div>

      {/* Blogs Grid */}
      {sortedBlogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blogs found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Blog Image */}
              {blog.image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <CardHeader className="pb-3">
                {/* Category and Featured Badge */}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {blog.category}
                  </Badge>
                  {blog.featured && (
                    <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                  <Link to={`/blog/${blog.id}`} className="text-lg">
                    {blog.title}
                  </Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Excerpt */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {blog.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author and Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={blog.author.avatar}
                      alt={blog.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{blog.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(blog.publishedAt)}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{blog.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{blog.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{blog.comments}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllBlogs
