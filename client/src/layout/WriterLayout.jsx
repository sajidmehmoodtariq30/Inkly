import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import WriterSidebar from '@/components/writer/WriterSidebar'
import WriterTopbar from '@/components/writer/WriterTopbar'
import WriterFooter from '@/components/writer/WriterFooter'

const WriterLayout = () => {
  return (
    <SidebarProvider>
      <WriterSidebar />
      <main className="flex-1 flex flex-col bg-background min-h-screen">
        <WriterTopbar />
        <div className='w-full min-h-[calc(95vh-216px)] flex flex-col pt-20'>
          <Outlet />
        </div>
        <WriterFooter />
      </main>
    </SidebarProvider>
  )
}

export default WriterLayout
