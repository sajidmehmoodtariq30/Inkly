import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
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
  ArrowLeft,
  Loader2
} from 'lucide-react'

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchTerm(query)
      performSearch(query, 1)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const performSearch = async (query, page = 1) => {
    if (!query.trim()) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        search: query.trim(),
        page: page.toString(),
        limit: '12'
      })

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/articles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to search articles')
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data.data.articles || [])
        setTotalPages(data.data.totalPages || 1)
        setTotalResults(data.data.totalArticles || 0)
        setCurrentPage(page)
      } else {
        throw new Error(data.message || 'Failed to search articles')
      }
    } catch (err) {
      setError('Failed to search articles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() })
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      performSearch(searchTerm, page)
    }
  }

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
        part
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Results</h1>
        {searchTerm && (
          <p className="text-gray-600">
            {loading ? 'Searching for' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for`} 
            <span className="font-semibold"> "{searchTerm}"</span>
          </p>
        )}
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Searching...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => performSearch(searchTerm)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : !searchTerm ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for articles</h3>
            <p className="text-gray-500">Enter a search term to find articles, topics, or authors</p>
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or browse our categories
            </p>
            <div className="mt-4">
              <Link to="/categories">
                <Button variant="outline">Browse Categories</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <Link key={article.id} to={`/article/${article.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  {article.featuredImage && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"
                        }}
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {/* Category */}
                      {article.category && (
                        <Badge variant="secondary" className="text-xs">
                          {article.category.name}
                        </Badge>
                      )}
                      
                      {/* Title */}
                      <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary transition-colors">
                        {highlightSearchTerm(article.title, searchTerm)}
                      </h3>
                      
                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {highlightSearchTerm(article.excerpt, searchTerm)}
                        </p>
                      )}
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{article.author?.fullName || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                        {article.readingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.readingTime} min</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{article.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SearchResults
