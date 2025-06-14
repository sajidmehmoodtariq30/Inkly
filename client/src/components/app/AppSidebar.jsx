import React, { useState, useEffect } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import logo from '../../assets/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { DotIcon, LogOutIcon, UserIcon, Shield, PenTool } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'



const AppSidebar = ({ items }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { get } = useApi()
  
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/categories`)
        
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data.categories || [])
        } else {
          console.error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <Sidebar>
      <SidebarHeader className={'bg-white'}>
        <img src={logo} alt="logo" className='w-48' />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Links</SidebarGroupLabel>
          <SidebarGroupContent className={'bg-white'}>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent className={'bg-white'}>
            <SidebarMenu>
              {categoriesLoading ? (
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
                    <DotIcon className="animate-pulse" />
                    <span>Loading categories...</span>
                  </div>
                </SidebarMenuItem>
              ) : (
                categories.map((category) => (
                  <SidebarMenuItem key={category._id}>
                    <SidebarMenuButton asChild>
                      <Link to={`/category/${category.slug}`}>
                        <DotIcon />
                        <span>{category.name}</span>
                        {category.articleCount > 0 && (
                          <span className="ml-auto text-xs text-gray-500">
                            {category.articleCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>      <SidebarFooter className="bg-white border-t">
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {user.fullName || 'User'}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuTrigger>                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleProfileClick}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      
                      {/* Dashboard buttons based on user role */}
                      {user.role === 'admin' && (
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}
                      
                      {user.role === 'writer' && (
                        <DropdownMenuItem onClick={() => navigate('/writer')}>
                          <PenTool className="mr-2 h-4 w-4" />
                          <span>Writer Dashboard</span>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar