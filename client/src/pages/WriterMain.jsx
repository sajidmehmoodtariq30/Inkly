import React from 'react'
import { useNavigate } from 'react-router-dom'

const WriterMain = () => {
  const navigate = useNavigate()

  // Redirect to writer dashboard
  React.useEffect(() => {
    navigate('/writer/dashboard', { replace: true })
  }, [navigate])

  return null
}

export default WriterMain
