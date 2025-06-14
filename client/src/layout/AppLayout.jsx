import Footer from '@/components/app/Footer'
import AppSidebar from '@/components/app/AppSidebar'
import Topbar from '@/components/app/Topbar'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Calendar, Home, Inbox, Search } from "lucide-react"

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Calendar,
  },
  {
    title: "All Blogs",
    url: "/blogs",
    icon: Search,
  },
  {
    title: "Comments",
    url: "/comments",
    icon: Inbox,
  },
]

const AppLayout = () => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar items={items} />
        <main className="flex-1 flex flex-col bg-background min-h-screen">
          <Topbar />
          <div className='w-full min-h-[calc(95vh-216px)] flex flex-col pt-20'>
            {<Outlet />}
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    </>
  )
}

export default AppLayout