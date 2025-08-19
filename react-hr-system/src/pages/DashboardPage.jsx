import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Loader from '../components/Loader'

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Loader />
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        <h1>Dashboard Content</h1>
        <p>Dashboard is loading successfully!</p>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage