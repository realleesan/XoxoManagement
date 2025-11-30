import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './components/common/Layout/Header.jsx'
import Sidebar from './components/common/Layout/Sidebar.jsx'
import './App.css'

const { Content } = Layout

function App() {
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
