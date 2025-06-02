import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
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
  Calendar,
  X,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
  ImagePlus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApi } from '../../hooks/useApi'
import { toast } from '../../utils/toast'

const WriterMediaLibrary = ({ onImageSelect = null, isSelectionMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [mediaFiles, setMediaFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [editingMedia, setEditingMedia] = useState(null)
  const [folders, setFolders] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const { get, post, put, delete: deleteApi, postFormData } = useApi()

  // Fetch media library on component mount
  useEffect(() => {
    fetchMediaLibrary()
    fetchFolders()
  }, [pagination.page, filterType, searchTerm])

  const fetchMediaLibrary = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filterType !== 'all' && { type: filterType }),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/media?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch media')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setMediaFiles(data.data.media || [])
        setPagination({
          page: data.data.pagination?.page || 1,
          limit: data.data.pagination?.limit || 20,
          total: data.data.pagination?.total || 0,
          pages: data.data.pagination?.pages || 1
        })
      }
    } catch (error) {
      toast.error('Failed to fetch media library')
      console.error('Media fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/media/folders`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFolders(data.data.folders || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  }

  // Drag and drop functionality
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)
    const uploadPromises = acceptedFiles.map(file => uploadFile(file))
    
    try {
      await Promise.all(uploadPromises)
      await fetchMediaLibrary() // Refresh the media library
      toast.success(`Successfully uploaded ${acceptedFiles.length} file(s)`)
    } catch (error) {
      toast.error('Some files failed to upload')
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }, [])  
  
  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('image', file)  // Field name matches multer config
    
    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      const response = await postFormData(`${import.meta.env.VITE_API_BASE_URL}writer/media`, formData)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }
      
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
      
      return await response.json()
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
      throw error
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })
  const deleteMedia = async (mediaId) => {
    try {
      const response = await deleteApi(`${import.meta.env.VITE_API_BASE_URL}writer/media/${mediaId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMediaFiles(prev => prev.filter(media => media._id !== mediaId))
          toast.success('Media deleted successfully')
        }
      }
    } catch (error) {
      toast.error('Failed to delete media')
    }
  }

  const updateMedia = async (mediaId, updates) => {
    try {
      const response = await put(`${import.meta.env.VITE_API_BASE_URL}writer/media/${mediaId}`, updates)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMediaFiles(prev => prev.map(media => 
            media._id === mediaId ? { ...media, ...updates } : media
          ))
          setEditingMedia(null)
          toast.success('Media updated successfully')
        }
      }
    } catch (error) {
      toast.error('Failed to update media')
    }
  }

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }
  const insertImageIntoEditor = (media) => {
    if (onImageSelect) {
      const markdownImage = `![${media.alt || media.originalName || media.filename}](${media.url})`
      onImageSelect(markdownImage)
      toast.success('Image inserted into editor')
    }
  }
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />
    } else if (mimeType?.startsWith('video/')) {
      return <Video className="h-8 w-8 text-purple-500" />
    } else {
      return <FileText className="h-8 w-8 text-red-500" />
    }
  }

  const getTypeColor = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return 'bg-blue-100 text-blue-800'
    } else if (mimeType?.startsWith('video/')) {
      return 'bg-purple-100 text-purple-800'
    } else {
      return 'bg-red-100 text-red-800'
    }
  }

  const getFileType = (mimeType) => {
    if (mimeType?.startsWith('image/')) return 'image'
    if (mimeType?.startsWith('video/')) return 'video'
    return 'document'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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
    const matchesSearch = file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.alt?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || getFileType(file.mimeType) === filterType
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalFiles: mediaFiles.length,
    totalSize: mediaFiles.reduce((acc, file) => acc + (file.size || 0), 0),
    images: mediaFiles.filter(f => f.mimeType?.startsWith('image/')).length,
    videos: mediaFiles.filter(f => f.mimeType?.startsWith('video/')).length,
    documents: mediaFiles.filter(f => !f.mimeType?.startsWith('image/') && !f.mimeType?.startsWith('video/')).length
  }

  // Upload progress component
  const UploadProgress = () => {
    const uploadEntries = Object.entries(uploadProgress)
    if (uploadEntries.length === 0) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Upload Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploadEntries.map(([filename, progress]) => (
              <div key={filename} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{filename}</span>
                    <span className="text-sm text-muted-foreground">
                      {progress === -1 ? 'Failed' : progress === 100 ? 'Complete' : `${progress}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        progress === -1 ? 'bg-red-500' : progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(0, progress)}%` }}
                    />
                  </div>
                </div>
                {progress === 100 && <CheckCircle className="h-5 w-5 text-green-500" />}
                {progress === -1 && <AlertCircle className="h-5 w-5 text-red-500" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isSelectionMode ? 'Select Media' : 'Media Library'}
          </h1>
          <p className="text-muted-foreground">
            {isSelectionMode 
              ? 'Choose an image to insert into your article' 
              : 'Manage your images, videos, and documents'
            }
          </p>
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
          {!isSelectionMode && (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button disabled={uploading}>
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      <UploadProgress />

      {/* Drag and Drop Zone */}
      {!isSelectionMode && (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Support for images, videos, and documents up to 10MB
          </p>
          <Button variant="outline">
            Browse Files
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      {!isSelectionMode && (
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
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
                <Download className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}      {/* Filter Tabs */}
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading media...</span>
        </div>
      ) : (
        <>
          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <Card 
                key={file._id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  isSelectionMode ? 'hover:ring-2 hover:ring-blue-500' : ''
                } ${selectedMedia?._id === file._id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => isSelectionMode && setSelectedMedia(file)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mimeType)}
                      <div className="flex-1 min-w-0">
                        <Badge className={`${getTypeColor(file.mimeType)} text-xs mb-1`}>
                          {getFileType(file.mimeType)}
                        </Badge>
                        <CardTitle className="text-sm truncate">{file.originalName}</CardTitle>
                      </div>
                    </div>
                    {!isSelectionMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingMedia(file)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteMedia(file._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {file.mimeType?.startsWith('image/') ? (                      <img 
                        src={file.url} 
                        alt={file.alt || file.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg items-center justify-center hidden">
                      {getFileIcon(file.mimeType)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    {file.dimensions && (
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span>{file.dimensions}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                  
                  {file.usageCount > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Used in {file.usageCount} article{file.usageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4">
                    {isSelectionMode ? (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => insertImageIntoEditor(file)}
                      >
                        <ImagePlus className="h-3 w-3 mr-1" />
                        Insert
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(file.url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}

          {filteredFiles.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No media files found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload your first media file to get started!'}
                </p>
                {!isSelectionMode && (
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Media
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Edit Media Modal */}
      {editingMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Media Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setEditingMedia(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>                  <label className="text-sm font-medium">Alt Text</label>
                  <Input
                    value={editingMedia.alt || ''}
                    onChange={(e) => setEditingMedia(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Describe this image..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Caption</label>
                  <Input
                    value={editingMedia.caption || ''}
                    onChange={(e) => setEditingMedia(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Optional caption..."
                  />
                </div>
                <div className="flex gap-2">                  <Button
                    onClick={() => updateMedia(editingMedia._id, {
                      alt: editingMedia.alt,
                      caption: editingMedia.caption
                    })}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingMedia(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default WriterMediaLibrary
