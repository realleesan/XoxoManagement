import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DollarOutlined,
  DatabaseOutlined,
  ToolOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/leads',
    icon: <UserOutlined />,
    label: 'Quản lý Lead',
  },
  {
    key: '/orders',
    icon: <ShoppingOutlined />,
    label: 'Đơn hàng',
  },
  {
    key: '/workflows',
    icon: <FileTextOutlined />,
    label: 'Quy trình sửa chữa',
  },
  {
    key: '/products',
    icon: <ShoppingOutlined />,
    label: 'Sản phẩm',
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: 'Khách hàng',
  },
  {
    key: '/services',
    icon: <ToolOutlined />,
    label: 'Dịch vụ',
  },
  {
    key: '/invoices',
    icon: <FileTextOutlined />,
    label: 'Hóa đơn',
  },
  {
    key: '/reports',
    icon: <FileTextOutlined />,
    label: 'Báo cáo',
  },
  {
    key: '/finance',
    icon: <DollarOutlined />,
    label: 'Tài chính',
  },
  {
    key: '/inventory',
    icon: <DatabaseOutlined />,
    label: 'Kho & NVL',
  },
]

function Sidebar({ collapsed = false, onCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Sider
      collapsible
      breakpoint="md"
      collapsedWidth={0}
      collapsed={collapsed}
      onCollapse={(c) => onCollapse?.(c)}
      onBreakpoint={(broken) => onCollapse?.(broken)}
      width={240}
      trigger={null}
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        height: '100%',
        overflow: 'auto',
        zIndex: 100
      }}
    >
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          background: '#1890ff',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 600
        }}
      >
        Xoxo
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{
          height: 'calc(100% - 65px)',
          borderRight: 0,
          paddingTop: '8px'
        }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  )
}

export default Sidebar

