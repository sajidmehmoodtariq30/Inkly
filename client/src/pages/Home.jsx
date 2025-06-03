import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  PenTool, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Star, 
  Clock, 
  ArrowRight, 
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  User,
  Loader2
} from 'lucide-react'

const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch featured posts, categories, and stats in parallel
      const [postsResponse, categoriesResponse, statsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}users/articles?featured=true&limit=3`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}categories`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}stats`)
      ])

      // Handle featured posts
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        if (postsData.success) {
          setFeaturedPosts(postsData.data?.articles?.slice(0, 3) || [])
        }
      }

      // Handle categories
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        if (categoriesData.success) {
          setCategories(categoriesData.data?.categories?.slice(0, 6) || [])
        }
      }

      // Handle stats
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          const statsArray = [
            { icon: BookOpen, label: "Articles", value: statsData.data?.totalArticles || "0" },
            { icon: Users, label: "Writers", value: statsData.data?.totalWriters || "0" },
            { icon: TrendingUp, label: "Monthly Views", value: statsData.data?.monthlyViews || "0" },
            { icon: Star, label: "Rating", value: statsData.data?.rating || "5.0" }
          ]
          setStats(statsArray)
        }
      } else {
        // Fallback stats if API fails
        setStats([
          { icon: BookOpen, label: "Articles", value: "150+" },
          { icon: Users, label: "Writers", value: "25+" },
          { icon: TrendingUp, label: "Monthly Views", value: "50K+" },
          { icon: Star, label: "Rating", value: "4.9" }
        ])
      }

    } catch (error) {
      console.error('Home data fetch error:', error)
      setError(error.message)
      // Set fallback data
      setStats([
        { icon: BookOpen, label: "Articles", value: "150+" },
        { icon: Users, label: "Writers", value: "25+" },
        { icon: TrendingUp, label: "Monthly Views", value: "50K+" },
        { icon: Star, label: "Rating", value: "4.9" }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 w-full min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Welcome to{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text">
                  Inkly
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Where ideas come to life through the power of words. Discover stories, insights, and perspectives that inspire.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6">
                <PenTool className="w-5 h-5 mr-2" />
                Start Writing
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Explore Stories
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-card">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading stats...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular and trending articles from our talented community of writers.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading featured posts...</span>
            </div>
          ) : featuredPosts.length > 0 ? (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featuredPosts.map((post) => (
                  <Link key={post._id || post.id} to={`/article/${post._id || post.id}`}>
                    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="relative overflow-hidden">
                        <img 
                          src={post.image || post.featured_image || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"} 
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 text-primary">
                            {post.category?.name || post.category || "General"}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-3">
                            {post.excerpt || post.content?.substring(0, 120) + '...'}
                          </p>
                        </div>                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {post.author?.avatar ? (
                              <img 
                                src={post.author.avatar} 
                                alt={post.author.fullName}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span>{post.author?.fullName || "Anonymous"}</span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <Clock className="w-4 h-4" />
                          <span>{post.readingTime || post.readTime || post.reading_time || "5 min read"}</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views || 0}</span>
                            </div>
                          </div>                          <span className="text-sm text-muted-foreground">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 
                             post.createdAt ? new Date(post.createdAt).toLocaleDateString() :
                             post.created_at ? new Date(post.created_at).toLocaleDateString() :
                             'Date not available'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center">
                <Link to="/blogs">
                  <Button variant="outline" size="lg">
                    View All Articles
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No featured posts available</h3>
              <p className="text-gray-500">Check back later for featured content</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Explore Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find content that matches your interests across various topics and technologies.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading categories...</span>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Link key={category._id || category.id || index} to={`/category/${category._id || category.id}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 text-center">
                    <CardContent className="p-6 space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <Badge variant="secondary" className={category.color || "bg-blue-100 text-blue-800"}>
                          {category.count || category.articleCount || 0} articles
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories available</h3>
              <p className="text-gray-500">Categories will appear here as content is added</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary/5">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Share Your Story?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community of writers and readers. Start writing today and reach thousands of engaged readers.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6">
              <PenTool className="w-5 h-5 mr-2" />
              Start Your Blog
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home