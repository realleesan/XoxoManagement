import { Layout } from 'antd'

const { Header: AntHeader } = Layout

function Header() {
  return (
    <AntHeader 
      style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
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
    </AntHeader>
  )
}

export default Header

