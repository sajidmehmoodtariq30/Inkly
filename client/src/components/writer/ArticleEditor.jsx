import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Save, 
  Eye, 
  Send, 
  Image, 
  Link2, 
  Bold, 
  Italic, 
  List, 
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { toast } from '../../utils/toast'

const ArticleEditor = () => {
  const { id } = useParams() // For editing existing articles
  const navigate = useNavigate()
  const { get, post, put } = useApi()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState('draft')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!id)

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchArticle()
    }
  }, [id])
  const fetchCategories = async () => {    try {
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/categories`)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch categories')
    }
  }
  const fetchArticle = async () => {
    try {
      setInitialLoading(true)
      const response = await get(`${import.meta.env.VITE_API_BASE_URL}writer/articles/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch article')
      }
      const data = await response.json()
      if (data.success) {
        const article = data.data
        setTitle(article.title)
        setContent(article.content)
        setCategoryId(article.category._id)
        setTags(article.tags.join(', '))
        setExcerpt(article.excerpt)
        setStatus(article.status)
      } else {
        toast.error('Article not found')
        navigate('/writer/articles')
      }
    } catch (error) {
      toast.error('Failed to fetch article')
      navigate('/writer/articles')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSave = async (saveStatus) => {
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error('Please fill in title, content, and select a category')
      return
    }

    try {
      setSaving(true)
      
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        categoryId,        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: saveStatus
      }

      let response
      if (id) {
        // Update existing article
        response = await put(`${import.meta.env.VITE_API_BASE_URL}writer/articles/${id}`, articleData)
      } else {
        // Create new article
        response = await post(`${import.meta.env.VITE_API_BASE_URL}writer/articles`, articleData)
      }

      if (!response.ok) {
        throw new Error('Failed to save article')
      }
      
      const data = await response.json()

      if (data.success) {
        toast.success(
          saveStatus === 'published' 
            ? 'Article published successfully!' 
            : 'Article saved successfully!'
        )
        
        if (!id) {
          // If creating new article, redirect to edit mode
          navigate(`/writer/edit/${data.data._id}`)
        } else {
          // Update local status
          setStatus(saveStatus)
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: Heading1, label: 'H1', action: 'h1' },
    { icon: Heading2, label: 'H2', action: 'h2' },
    { icon: Heading3, label: 'H3', action: 'h3' },
    { icon: List, label: 'List', action: 'list' },
    { icon: Quote, label: 'Quote', action: 'quote' },
    { icon: Code, label: 'Code', action: 'code' },
    { icon: Link2, label: 'Link', action: 'link' },
    { icon: Image, label: 'Image', action: 'image' },
  ]

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading article...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/writer/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Article' : 'Write New Article'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button 
            variant="outline"
            disabled={saving}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={() => handleSave('published')}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>Write your article content here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="Enter article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Excerpt</label>
                <Textarea
                  placeholder="Brief description of your article..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
              </div>              {/* Editor Toolbar */}
              <div className="border-t border-b py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {toolbarButtons.map((button) => (
                    <Button
                      key={button.action}
                      variant="ghost"
                      size="sm"
                      onClick={() => {}}
                      title={button.label}
                    >
                      <button.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content *</label>
                <Textarea
                  placeholder="Start writing your article content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="min-h-[500px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="review">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Under Review
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Published
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {status === 'published' && (
                  <p className="text-xs text-green-600 mt-1">
                    This article is live and visible to readers
                  </p>
                )}
                {status === 'review' && (
                  <p className="text-xs text-blue-600 mt-1">
                    This article is pending review before publication
                  </p>
                )}
                {status === 'draft' && (
                  <p className="text-xs text-yellow-600 mt-1">
                    This article is saved as a draft
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-3 block">Quick Actions</label>
                <div className="space-y-2">
                  {status === 'draft' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleSave('review')}
                      disabled={saving}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Review
                    </Button>
                  )}
                  {status === 'review' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleSave('published')}
                        disabled={saving}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Publish Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Move to Draft
                      </Button>
                    </>
                  )}
                  {status === 'published' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleSave('draft')}
                      disabled={saving}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Unpublish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Write compelling headlines</p>
                <p>• Use clear, concise language</p>
                <p>• Break content into sections</p>
                <p>• Add relevant tags for discovery</p>
                <p>• Preview before publishing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ArticleEditor
