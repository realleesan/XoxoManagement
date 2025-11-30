import { Outlet, useLocation } from 'react-router-dom'
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

  if (isAuthPage) {
    return <Outlet />
  }

  return (
    <Layout className="app-layout">
      <Sidebar />
      <Layout style={{ marginLeft: 240 }}>
        <Header />
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
