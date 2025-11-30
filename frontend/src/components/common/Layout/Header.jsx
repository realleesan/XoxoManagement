import { Layout, Button, Dropdown, Avatar } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../store/authStore.js'

const { Header: AntHeader } = Layout

function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader 
      style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>
        XoxoManagement
      </h2>
      {user && (
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user.name} ({user.role})</span>
          </div>
        </Dropdown>
      )}
    </AntHeader>
  )
}

export default Header

