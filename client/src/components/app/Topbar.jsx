import React from 'react'
import { SidebarTrigger, useSidebar } from '../ui/sidebar'
import logo from '../../assets/logo.png'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { LogInIcon, UserIcon, LogOutIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Searchbox from './Searchbox'

const Topbar = () => {
  const { state, isMobile } = useSidebar()
  const { user, logout, loading } = useAuth()
  
  // Calculate the left offset for the topbar when sidebar is open
  const sidebarWidth = '16rem' // This matches SIDEBAR_WIDTH from sidebar.jsx
  const isExpanded = state === 'expanded'

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
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
      </div>      <div>
        {loading ? (
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-full"></div>
        ) : user ? (
          <div className="flex items-center">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="rounded-full"
            >
              <span>Logout</span> <LogOutIcon className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button asChild variant={'outline'} className='rounded-full w-32'>
            <Link to="/login">
              <LogInIcon />
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default Topbar