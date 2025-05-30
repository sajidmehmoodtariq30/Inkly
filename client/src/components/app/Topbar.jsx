import React from 'react'
import { SidebarTrigger, useSidebar } from '../ui/sidebar'
import logo from '../../assets/logo.png'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { LogInIcon } from 'lucide-react'
import Searchbox from './Searchbox'

const Topbar = () => {
  const { state, isMobile } = useSidebar()
  
  // Calculate the left offset for the topbar when sidebar is open
  const sidebarWidth = '16rem' // This matches SIDEBAR_WIDTH from sidebar.jsx
  const isExpanded = state === 'expanded'
  
  return (
    <div 
      className='flex items-center justify-between bg-gray-100 w-full p-4 h-20 fixed top-0 z-50 border-b transition-all duration-200 ease-linear'
      style={{
        left: !isMobile && isExpanded ? sidebarWidth : '0',
        width: !isMobile && isExpanded ? `calc(100% - ${sidebarWidth})` : '100%'
      }}
    >
      <div className='flex items-center gap-2'>
        <SidebarTrigger />
        <img src={logo} alt="logo" className='w-24' />
      </div>
      <div>
        <Searchbox />
      </div>
      <div>
        <Button asChild variant={'outline'} className='rounded-full w-32'>
          <Link to="/login">
            <LogInIcon />
            Login
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default Topbar