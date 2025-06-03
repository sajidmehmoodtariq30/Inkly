import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { toast } from '../utils/toast'

const ArticlePage = () => {
  const { identifier } = useParams() // Can be ID or slug
  const navigate = useNavigate()
  const { get } = useApi()
  
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (identifier) {
      fetchArticle()
    }
  }, [identifier])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}users/articles/${identifier}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found')
        }
        throw new Error('Failed to fetch article')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setArticle(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch article')
      }
    } catch (error) {
      console.error('Article fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Article link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
        toast.error('Failed to copy link')
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Article Not Found</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-2">
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => navigate('/')} variant="default">
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Article Header */}
      <article className="space-y-8">
        <header className="space-y-6">
          {/* Category Badge */}
          {article.category && (
            <div>
              <Link to={`/category/${article.category.slug}`}>
                <Badge 
                  variant="outline" 
                  className="text-sm font-medium hover:bg-gray-100"
                  style={{ 
                    borderColor: article.category.color,
                    color: article.category.color 
                  }}
                >
                  {article.category.name}
                </Badge>
              </Link>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-t border-b border-gray-200">
            {/* Author and Date */}
            <div className="flex items-center space-x-4">
              {article.author.avatar ? (
                <img 
                  src={article.author.avatar} 
                  alt={article.author.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {article.author.fullName}
                </p>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.readingTime} min read
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  {article.comments.length}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="w-full">
            <img 
              src={article.featuredImage} 
              alt={article.title}
              className="w-full h-64 sm:h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Author Bio */}
        {article.author.bio && (
          <div className="space-y-3">
            <Separator />
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  {article.author.avatar ? (
                    <img 
                      src={article.author.avatar} 
                      alt={article.author.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About {article.author.fullName}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {article.author.bio}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comments Section */}
        {article.comments && article.comments.length > 0 && (
          <div className="space-y-6">
            <Separator />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Comments ({article.comments.length})
              </h3>
              <div className="space-y-6">
                {article.comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-start space-x-3">
                      {comment.user.avatar ? (
                        <img 
                          src={comment.user.avatar} 
                          alt={comment.user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {comment.user.fullName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div className="space-y-6">
            <Separator />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {article.relatedArticles.map((related) => (
                  <Card key={related.id} className="hover:shadow-lg transition-shadow">
                    <Link to={`/article/${related.slug || related.id}`}>
                      {related.featuredImage && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={related.featuredImage} 
                            alt={related.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                          {related.title}
                        </h4>
                        {related.excerpt && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {related.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{related.author.fullName}</span>
                          <div className="flex items-center space-x-2">
                            <span>{related.readingTime} min</span>
                            <span>•</span>
                            <span>{related.views} views</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

export default ArticlePage
