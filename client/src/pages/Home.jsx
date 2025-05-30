import React from 'react'
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
  User
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
  // Mock data for blog posts
  const featuredPosts = [
    {
      id: 1,
      title: "The Future of Web Development: Trends to Watch in 2025",
      excerpt: "Explore the latest trends shaping the future of web development, from AI-powered tools to emerging frameworks...",
      author: "Alex Johnson",
      date: "2 days ago",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
      category: "Technology",
      likes: 124,
      comments: 18,
      views: 2340
    },
    {
      id: 2,
      title: "Mastering React Performance: A Complete Guide",
      excerpt: "Learn advanced techniques to optimize your React applications for better performance and user experience...",
      author: "Sarah Chen",
      date: "4 days ago",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
      category: "React",
      likes: 89,
      comments: 12,
      views: 1890
    },
    {
      id: 3,
      title: "Building Scalable APIs with Node.js and Express",
      excerpt: "A comprehensive guide to creating robust, scalable APIs that can handle millions of requests...",
      author: "Mike Rodriguez",
      date: "1 week ago",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
      category: "Backend",
      likes: 156,
      comments: 24,
      views: 3210
    }
  ]

  const categories = [
    { name: "Technology", count: 45, color: "bg-blue-100 text-blue-800" },
    { name: "React", count: 32, color: "bg-cyan-100 text-cyan-800" },
    { name: "JavaScript", count: 28, color: "bg-yellow-100 text-yellow-800" },
    { name: "Design", count: 19, color: "bg-purple-100 text-purple-800" },
    { name: "Backend", count: 23, color: "bg-green-100 text-green-800" },
    { name: "Career", count: 15, color: "bg-pink-100 text-pink-800" }
  ]

  const stats = [
    { icon: BookOpen, label: "Articles", value: "150+" },
    { icon: Users, label: "Writers", value: "25+" },
    { icon: TrendingUp, label: "Monthly Views", value: "50K+" },
    { icon: Star, label: "Rating", value: "4.9" }
  ]

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

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-primary">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg">
              View All Articles
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className={category.color}>
                      {category.count} articles
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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