import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { 
  Search, 
  FileText, 
  Calendar,
  ArrowLeft,
  User,
  Clock,
  TrendingUp
} from 'lucide-react'

const CategoryDetail = () => {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategoryAndArticles()
  }, [slug])

  const fetchCategoryAndArticles = async () => {
    try {
      setLoading(true)
      
      // Fetch category details
      const categoryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/categories`)
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        const foundCategory = categoryData.data.categories.find(cat => cat.slug === slug)
        
        if (foundCategory) {
          setCategory(foundCategory)
        } else {
          setError('Category not found')
        }
      }
      
      // TODO: Fetch articles for this category when API is available
      // For now, using mock data
      setArticles([
        {
          id: 1,
          title: `Getting Started with ${slug}`,
          excerpt: `Learn the basics of ${slug} and how to implement it in your projects.`,
          author: 'John Doe',
          publishedAt: '2024-01-15',
          readTime: '5 min read',
          tags: [slug, 'beginner', 'tutorial']
        },
        {
          id: 2,
          title: `Advanced ${slug} Techniques`,
          excerpt: `Dive deep into advanced concepts and best practices for ${slug}.`,
          author: 'Jane Smith',
          publishedAt: '2024-01-10',
          readTime: '8 min read',
          tags: [slug, 'advanced', 'tips']
        }
      ])
      
    } catch (err) {
      setError('Failed to fetch category data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/categories">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/categories" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: category?.color || '#6b7280' }}
          >
            {category?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category?.name || 'Category'}</h1>
            <p className="text-gray-600">{category?.description || 'No description available'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{category?.articleCount || 0} articles</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Popular category</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-6">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h2>
            <p className="text-gray-600">
              {searchTerm 
                ? 'No articles match your search criteria.' 
                : 'No articles available in this category yet.'
              }
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      <Link to={`/article/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Link to={`/article/${article.id}`}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default CategoryDetail
