import React from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  FileText,
  PenTool,
  BookOpen,
  MessageSquare,
  User,
  Calendar,
  Tag,
  Eye,
  TrendingUp,
  Clock,
  Heart,
  Home
} from "lucide-react"
import logo from '../../assets/logo.png'

const WriterSidebar = () => {
  const location = useLocation()
  const { user } = useSelector(state => state.auth)

  const menuItems = [
    {
      title: "Dashboard",
      url: "/writer/dashboard",
      icon: BarChart3,
      description: "Overview and analytics"
    },
    {
      title: "My Articles",
      url: "/writer/articles",
      icon: FileText,
      description: "Manage your articles"
    },
    {
      title: "Write New",
      url: "/writer/write",
      icon: PenTool,
      description: "Create new article"
    },
    {
      title: "Drafts",
      url: "/writer/drafts",
      icon: Clock,
      description: "Work in progress"
    },
    {
      title: "Published",
      url: "/writer/published",
      icon: BookOpen,
      description: "Live articles"
    },
    {
      title: "Analytics",
      url: "/writer/analytics",
      icon: TrendingUp,
      description: "Performance metrics"
    },
    {
      title: "Comments",
      url: "/writer/comments",
      icon: MessageSquare,
      description: "Reader feedback"
    },
    {
      title: "Categories",
      url: "/writer/categories",
      icon: Tag,
      description: "Manage topics"
    },
    {
      title: "Media Library",
      url: "/writer/media",
      icon: Eye,
      description: "Images and files"
    }
  ]


  return (
    <Sidebar className="border-r">      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Inkly" className="h-10 w-10 object-contain" />
          <div>
            <h2 className="font-bold text-lg">Inkly</h2>
            <p className="text-sm text-muted-foreground">Writer Panel</p>
          </div>
        </Link>
      </SidebarHeader>      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className="w-full justify-start gap-3 px-3 py-2.5 text-left hover:bg-accent rounded-md transition-colors mb-2"
                >
                  <Link to="/">
                    <Home className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Back to Site</div>
                      <div className="text-xs text-muted-foreground">Return to main site</div>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="w-full justify-start gap-3 px-3 py-2.5 text-left hover:bg-accent rounded-md transition-colors"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>      <SidebarFooter className="border-t px-4 py-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName || 'Writer'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Heart className="h-4 w-4 text-red-500" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default WriterSidebar
