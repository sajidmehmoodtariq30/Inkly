import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Tags, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Eye,
  EyeOff,
  Hash
} from 'lucide-react'

const CategoryManagement = () => {
  const [categories, setCategories] = useState([])
  const [hierarchy, setHierarchy] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [viewMode, setViewMode] = useState('flat') // 'flat' or 'hierarchy'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  useEffect(() => {
    fetchCategories()
    fetchHierarchy()
    fetchParentCategories()
  }, [])
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/v1/admin/categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      
      // Ensure we have a valid array of categories
      const categoriesArray = data.data?.categories || data.categories || []
      setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
    } catch (err) {
      setError(err.message)
      setCategories([]) // Ensure categories is always an array
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHierarchy = async () => {
    try {
      const response = await fetch('/api/v1/admin/categories/hierarchy', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch category hierarchy')
      }

      const data = await response.json()
      setHierarchy(data.data || [])
    } catch (err) {
      console.error('Error fetching hierarchy:', err)
      setHierarchy([])
    }
  }

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/v1/admin/categories?limit=100', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch parent categories')
      }

      const data = await response.json()
      const categoriesArray = data.data?.categories || data.categories || []
      // Only include root categories (no parent) as potential parents
      const rootCategories = categoriesArray.filter(cat => !cat.parentCategory)
      setParentCategories(rootCategories)
    } catch (err) {
      console.error('Error fetching parent categories:', err)
      setParentCategories([])
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(filteredCategories.map(cat => cat._id))
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setShowEditModal(true)
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/v1/admin/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {        throw new Error('Failed to delete category')
      }

      fetchCategories()
      fetchHierarchy()
      fetchParentCategories()
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }

  const handleToggleVisibility = async (categoryId, isVisible) => {
    try {
      const response = await fetch(`/api/v1/admin/categories/${categoryId}/visibility`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVisible: !isVisible })
      })

      if (!response.ok) {        throw new Error('Failed to update category visibility')
      }

      fetchCategories()
      fetchHierarchy()
      fetchParentCategories()
    } catch (err) {
      console.error('Error updating category visibility:', err)
    }
  }

  const handleAddCategory = async (categoryData) => {
    try {
      const response = await fetch('/api/v1/admin/categories', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }      setShowAddModal(false)
      fetchCategories()
      fetchHierarchy()
      fetchParentCategories()
    } catch (err) {
      console.error('Error creating category:', err)
    }
  }

  const handleEditCategorySubmit = async (categoryData) => {
    try {
      const response = await fetch(`/api/v1/admin/categories/${editingCategory._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }      setShowEditModal(false)
      setEditingCategory(null)
      fetchCategories()
      fetchHierarchy()
      fetchParentCategories()
    } catch (err) {
      console.error('Error updating category:', err)
    }
  }

  const toggleExpanded = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderHierarchicalCategories = (categoryList, depth = 0) => {
    if (!Array.isArray(categoryList)) return []
    
    return categoryList.flatMap(category => {
      const categoryRow = (
        <CategoryRow
          key={category._id}
          category={category}
          depth={depth}
          isSelected={selectedCategories.includes(category._id)}
          onSelect={() => handleSelectCategory(category._id)}
          onEdit={() => handleEditCategory(category)}
          onDelete={() => handleDeleteCategory(category._id)}
          onToggleVisibility={() => handleToggleVisibility(category._id, category.isVisible)}
          isExpanded={expandedCategories.has(category._id)}
          onToggleExpanded={() => toggleExpanded(category._id)}
          hasChildren={category.children && category.children.length > 0}
        />
      )
      
      const childRows = category.children && expandedCategories.has(category._id) 
        ? renderHierarchicalCategories(category.children, depth + 1)
        : []
      
      return [categoryRow, ...childRows]
    })
  }  
  const filterHierarchy = (categoryList, term) => {
    if (!Array.isArray(categoryList)) return []
    
    return categoryList.reduce((acc, category) => {
      const matchesSearch = category.name?.toLowerCase().includes(term.toLowerCase()) ||
                           category.description?.toLowerCase().includes(term.toLowerCase())
      
      const filteredChildren = category.children ? filterHierarchy(category.children, term) : []
      
      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...category,
          children: filteredChildren
        })
      }
      
      return acc
    }, [])
  }

  const filteredCategories = Array.isArray(categories) ? categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredHierarchy = searchTerm ? 
    filterHierarchy(hierarchy, searchTerm) : 
    hierarchy

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Category Management</h3>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading categories</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <Button 
                onClick={fetchCategories}
                className="mt-2"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Category Management</h3>
          <p className="text-gray-600">Manage article categories and hierarchies ({Array.isArray(categories) ? categories.length : 0} total categories)</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2 mr-2">
            <Button 
              variant={viewMode === 'flat' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('flat')}
            >
              Flat View
            </Button>
            <Button 
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('hierarchy')}
            >
              Tree View
            </Button>
          </div>
          <Button variant="outline">
            Export Categories
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Hide Selected ({selectedCategories.length})
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  Delete Selected ({selectedCategories.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Categories</span>
            {selectedCategories.length > 0 && (
              <span className="text-sm font-normal text-gray-600">
                {selectedCategories.length} selected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Posts</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>              <tbody className="divide-y divide-gray-200">
                {viewMode === 'flat' ? (
                  filteredCategories.map((category) => (
                    <CategoryRow
                      key={category._id}
                      category={category}
                      isSelected={selectedCategories.includes(category._id)}
                      onSelect={() => handleSelectCategory(category._id)}
                      onEdit={() => handleEditCategory(category)}
                      onDelete={() => handleDeleteCategory(category._id)}
                      onToggleVisibility={() => handleToggleVisibility(category._id, category.isVisible)}
                      isExpanded={expandedCategories.has(category._id)}
                      onToggleExpanded={() => toggleExpanded(category._id)}
                    />
                  ))                ) : (
                  // Hierarchical view
                  renderHierarchicalCategories(filteredHierarchy, 0)
                )}
              </tbody>
            </table>

            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No categories found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Create your first category to get started'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>      {/* Add Category Modal */}
      {showAddModal && (
        <CategoryModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCategory}
          title="Add New Category"
          parentCategories={parentCategories}
        />
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowEditModal(false)
            setEditingCategory(null)
          }}
          onSubmit={handleEditCategorySubmit}
          title="Edit Category"
          parentCategories={parentCategories}
        />
      )}
    </div>
  )
}

// Category Row Component
const CategoryRow = ({ 
  category, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onToggleVisibility, 
  isExpanded, 
  onToggleExpanded, 
  depth = 0, 
  hasChildren 
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300"
        />
      </td>      <td className="px-4 py-3">
        <div className="flex items-center space-x-3" style={{ paddingLeft: `${depth * 20}px` }}>
          {hasChildren ? (
            <button onClick={onToggleExpanded} className="text-gray-400 hover:text-gray-600">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-4 h-4" /> // Spacer for alignment
          )}
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: category.color || '#6366f1' }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">{category.name}</p>
                {depth > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    Child
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">#{category.slug}</p>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-900 max-w-xs truncate">{category.description || 'No description'}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <Hash className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-900">{category.postCount || 0}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
          category.isVisible 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {category.isVisible ? 'Visible' : 'Hidden'}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-900">
          {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleVisibility}
            className={category.isVisible ? 'text-gray-600' : 'text-green-600'}
          >
            {category.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

// Category Modal Component
const CategoryModal = ({ category, onClose, onSubmit, title, parentCategories = [] }) => {
  const [name, setName] = useState(category?.name || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')
  const [color, setColor] = useState(category?.color || '#6366f1')
  const [isVisible, setIsVisible] = useState(category?.isVisible ?? true)
  const [parentId, setParentId] = useState(category?.parentCategory?._id || category?.parentCategory || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (e) => {
    const newName = e.target.value
    setName(newName)
    if (!category) { // Only auto-generate slug for new categories
      setSlug(generateSlug(newName))
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    // For editing, include slug if it was manually changed
    // For creating, let server auto-generate slug
    const categoryData = {
      name: name.trim(),
      description: description.trim(),
      color,
      isVisible,
      parentCategory: parentId || null
    }

    // Only include slug for updates if category exists and slug was modified
    if (category && slug.trim()) {
      categoryData.slug = slug.trim()
    }

    try {
      await onSubmit(categoryData)
      setSuccess('Category saved successfully')
      if (!category) {
        // Reset form for new category
        setName('')
        setSlug('')
        setDescription('')
        setColor('#6366f1')
        setIsVisible(true)
        setParentId('')
      }
    } catch (err) {
      setError('Failed to save category')
      console.error('Error saving category:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
              required
            />
          </div>
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug {category ? '*' : '(Auto-generated)'}
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={category ? "category-slug" : "Auto-generated from name"}
              disabled={!category}
              required={!!category}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter category description"
            />          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Parent (Root Category)</option>
              {parentCategories.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#6366f1"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Visible to public</span>
            </label>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {category ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryManagement
