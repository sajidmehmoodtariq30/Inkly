import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { 
  Upload, 
  Search, 
  Filter, 
  Image, 
  Video, 
  FileText, 
  Download,
  Trash2,
  MoreHorizontal,
  Eye,
  Copy,
  Calendar
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const WriterMediaLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Mock data - replace with real data later
  const mediaFiles = [
    {
      id: 1,
      name: "react-hooks-guide.jpg",
      type: "image",
      size: "245 KB",
      dimensions: "1200x600",
      uploadedAt: "2024-01-20T10:30:00Z",
      url: "/images/react-hooks-guide.jpg",
      alt: "React Hooks Guide Illustration",
      usedIn: ["Getting Started with React Hooks", "Advanced React Patterns"]
    },
    {
      id: 2,
      name: "javascript-patterns.png",
      type: "image",
      size: "156 KB",
      dimensions: "800x400",
      uploadedAt: "2024-01-19T15:45:00Z",
      url: "/images/javascript-patterns.png",
      alt: "JavaScript Design Patterns",
      usedIn: ["Advanced JavaScript Patterns"]
    },
    {
      id: 3,
      name: "coding-tutorial.mp4",
      type: "video",
      size: "12.5 MB",
      dimensions: "1920x1080",
      uploadedAt: "2024-01-18T09:15:00Z",
      url: "/videos/coding-tutorial.mp4",
      alt: "Coding Tutorial Video",
      usedIn: []
    },
    {
      id: 4,
      name: "api-documentation.pdf",
      type: "document",
      size: "892 KB",
      dimensions: "A4",
      uploadedAt: "2024-01-17T14:20:00Z",
      url: "/docs/api-documentation.pdf",
      alt: "API Documentation",
      usedIn: ["Building Scalable APIs"]
    },
    {
      id: 5,
      name: "css-grid-layout.jpg",
      type: "image",
      size: "198 KB",
      dimensions: "1000x500",
      uploadedAt: "2024-01-16T11:10:00Z",
      url: "/images/css-grid-layout.jpg",
      alt: "CSS Grid Layout Example",
      usedIn: ["CSS Grid vs Flexbox"]
    },
    {
      id: 6,
      name: "node-architecture.svg",
      type: "image",
      size: "45 KB",
      dimensions: "800x600",
      uploadedAt: "2024-01-15T16:30:00Z",
      url: "/images/node-architecture.svg",
      alt: "Node.js Architecture Diagram",
      usedIn: ["Building Scalable Node.js Applications"]
    }
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />
      case 'document':
        return <FileText className="h-8 w-8 text-red-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'image':
        return 'bg-blue-100 text-blue-800'
      case 'video':
        return 'bg-purple-100 text-purple-800'
      case 'document':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.alt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || file.type === filterType
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalFiles: mediaFiles.length,
    totalSize: "25.4 MB",
    images: mediaFiles.filter(f => f.type === 'image').length,
    videos: mediaFiles.filter(f => f.type === 'video').length,
    documents: mediaFiles.filter(f => f.type === 'document').length
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage your images, videos, and documents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <p className="text-2xl font-bold">{stats.images}</p>
              </div>
              <Image className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="text-2xl font-bold">{stats.videos}</p>
              </div>
              <Video className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{stats.documents}</p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">{stats.totalSize}</p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'image', 'video', 'document'].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            onClick={() => setFilterType(type)}
            className="capitalize"
          >
            {type === 'all' ? 'All Files' : `${type}s`}
          </Button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <Badge className={`${getTypeColor(file.type)} text-xs mb-1`}>
                      {file.type}
                    </Badge>
                    <CardTitle className="text-sm truncate">{file.name}</CardTitle>
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
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
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
              {/* Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                {file.type === 'image' ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-blue-400" />
                  </div>
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{file.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{file.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
              
              {file.usedIn.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Used in:</p>
                  <div className="flex flex-wrap gap-1">
                    {file.usedIn.slice(0, 2).map((article, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {article.length > 20 ? `${article.substring(0, 20)}...` : article}
                      </Badge>
                    ))}
                    {file.usedIn.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{file.usedIn.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media files found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload your first media file to get started!'}
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WriterMediaLibrary
