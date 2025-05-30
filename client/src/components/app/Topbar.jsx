import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'
import logo from '../../assets/logo.png'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { LogInIcon } from 'lucide-react'
import Searchbox from './Searchbox'

const Topbar = () => {
  return (
    <div className='flex items-center justify-between bg-gray-100 w-screen p-4 h-20 fixed top-0 z-50 border-b'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger />
        <img src={logo} alt="logo" className='w-24' />
      </div>
      <div>
        <Searchbox />
      </div>
      <div>
        <Button asChild variant={'outline'} className='rounded-full'>
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