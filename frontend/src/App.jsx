import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Layout } from 'antd'
import Header from './components/common/Layout/Header.jsx'
import Sidebar from './components/common/Layout/Sidebar.jsx'
import { useAuth } from './hooks/useAuth.js'
import './App.css'

const { Content } = Layout

function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  
  // Load user info if token exists
  useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (isAuthPage) {
    return <Outlet />
  }

  return (
    <Layout className="app-layout">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 0 : 240) }}>
        <Header collapsed={collapsed} onToggle={setCollapsed} />
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
