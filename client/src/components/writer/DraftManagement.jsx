import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { 
  Clock, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const DraftManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated')

  // Mock data - replace with real data later
  const drafts = [
    {
      id: 1,
      title: "Advanced React Patterns and Best Practices",
      excerpt: "Exploring advanced patterns in React development including compound components, render props, and hooks...",
      lastModified: "2024-01-20T10:30:00Z",
      wordCount: 1247,
      category: "Technology",
      tags: ["React", "JavaScript", "Frontend"],
      estimatedReadTime: 6
    },
    {
      id: 2,
      title: "The Future of Web Development",
      excerpt: "Looking ahead at emerging technologies and trends that will shape web development in the coming years...",
      lastModified: "2024-01-19T15:45:00Z",
      wordCount: 892,
      category: "Technology",
      tags: ["Web Development", "Future", "Trends"],
      estimatedReadTime: 4
    },
    {
      id: 3,
      title: "Building Scalable Node.js Applications",
      excerpt: "A comprehensive guide to building and scaling Node.js applications for production environments...",
      lastModified: "2024-01-18T09:15:00Z",
      wordCount: 2156,
      category: "Backend",
      tags: ["Node.js", "Scalability", "Backend"],
      estimatedReadTime: 9
    },
    {
      id: 4,
      title: "CSS Grid vs Flexbox: When to Use What",
      excerpt: "Understanding the differences between CSS Grid and Flexbox and when to use each layout method...",
      lastModified: "2024-01-17T14:20:00Z",
      wordCount: 675,
      category: "CSS",
      tags: ["CSS", "Layout", "Grid", "Flexbox"],
      estimatedReadTime: 3
    }
  ]

  const getStatusColor = (wordCount) => {
    if (wordCount < 500) return 'bg-red-100 text-red-800'
    if (wordCount < 1000) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getStatusText = (wordCount) => {
    if (wordCount < 500) return 'Just Started'
    if (wordCount < 1000) return 'In Progress'
    return 'Nearly Complete'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Draft Articles</h1>
          <p className="text-muted-foreground">Manage your work in progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Drafts</p>
                <p className="text-2xl font-bold">{drafts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nearly Complete</p>
                <p className="text-2xl font-bold">
                  {drafts.filter(d => d.wordCount >= 1000).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold">
                  {drafts.reduce((sum, d) => sum + d.wordCount, 0).toLocaleString()}
                </p>
              </div>
              <Edit className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Read Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(drafts.reduce((sum, d) => sum + d.estimatedReadTime, 0) / drafts.length)} min
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drafts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDrafts.map((draft) => (
          <Card key={draft.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {draft.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(draft.wordCount)}>
                      {getStatusText(draft.wordCount)}
                    </Badge>
                    <Badge variant="outline">{draft.category}</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Continue Writing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3 mb-4">
                {draft.excerpt}
              </CardDescription>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {draft.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{draft.wordCount} words</span>
                  <span>{draft.estimatedReadTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(draft.lastModified)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Button className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Continue Writing
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrafts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start writing your first article!'}
            </p>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Write New Article
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DraftManagement
