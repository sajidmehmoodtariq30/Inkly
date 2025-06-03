import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { 
  Search, 
  FileText, 
  Users, 
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}categories`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
        if (data.success) {
        setCategories(data.data.categories || [])
      } else {
        throw new Error(data.message || 'Failed to fetch categories')
      }
    } catch (err) {
      setError('Failed to fetch categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const featuredCategories = filteredCategories.filter(cat => cat.featured)
  const regularCategories = filteredCategories.filter(cat => !cat.featured)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchCategories} className="mt-4">
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">Explore topics and find articles that interest you</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">            {featuredCategories.map((category) => (
              <Card key={category._id || category.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-blue-100">
                {/* Category Image */}
                {category.image && (
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {category.trending && (
                        <Badge variant="default" className="bg-red-500 hover:bg-red-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                        Featured
                      </Badge>
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl hover:text-blue-600 transition-colors">                      <Link to={`/category/${category.slug}`}>
                        {category.name}
                      </Link>
                    </CardTitle>
                    {category.color && (
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    )}
                  </div>
                </CardHeader>                <CardContent>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{category.articleCount || 0} articles</span>
                    </div>
                    {category.followerCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{category.followerCount.toLocaleString()} followers</span>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/category/${category.slug}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Explore Category
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Categories */}
      {regularCategories.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">            {regularCategories.map((category) => (
              <Card key={category._id || category.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Category Image */}
                {category.image && (
                  <div className="h-32 overflow-hidden relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {category.trending && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="default" className="bg-red-500 hover:bg-red-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg hover:text-blue-600 transition-colors">                      <Link to={`/category/${category.slug}`}>
                        {category.name}
                      </Link>
                    </CardTitle>
                    {category.color && (
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    )}
                  </div>
                </CardHeader>                <CardContent className="pt-0">
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{category.articleCount || 0}</span>
                    </div>
                    {category.followerCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{category.followerCount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/category/${category.slug}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Articles
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No categories found matching your search.' : 'No categories available yet.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Categories
