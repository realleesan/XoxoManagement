import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Typography } from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  FileTextOutlined, 
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { getDashboardStats } from '../services/dashboard.service.js';
import { formatCurrency } from '../utils/format.js';

const { Title } = Typography;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    overview: {
      totalLeads: 0,
      totalCustomers: 0,
      productsInProgress: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      pendingInvoices: 0,
      activeWorkflows: 0,
      recentLeads: 0,
    },
    leadsByStatus: {},
    revenueByMonth: [],
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      console.log('Dashboard data received:', data);
      // Validate data structure
      if (data && data.overview) {
        setStats(data);
      } else {
        console.error('Invalid data structure:', data);
        // Set default stats if data is invalid
        setStats({
          overview: {
            totalLeads: 0,
            totalCustomers: 0,
            productsInProgress: 0,
            monthlyRevenue: 0,
            yearlyRevenue: 0,
            pendingInvoices: 0,
            activeWorkflows: 0,
            recentLeads: 0,
          },
          leadsByStatus: {},
          revenueByMonth: [],
        });
        setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra backend API.');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          title="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => {
            setError(null);
            fetchDashboardStats();
          }}
        />
      </div>
    );
  }

  // Safe destructuring with defaults
  const { overview = {} } = stats || {};

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Dashboard Tổng quan
      </Title>

      {/* Main Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Tổng Leads" 
              value={overview.totalLeads}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Khách hàng" 
              value={overview.totalCustomers}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Sản phẩm đang làm" 
              value={overview.productsInProgress}
              prefix={<ShoppingOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Doanh thu tháng" 
              value={overview.monthlyRevenue}
              prefix={<DollarOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Doanh thu năm" 
              value={overview.yearlyRevenue}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Hóa đơn chờ thanh toán" 
              value={overview.pendingInvoices}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Quy trình đang chạy" 
              value={overview.activeWorkflows}
              prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic 
              title="Leads mới (7 ngày)" 
              value={overview.recentLeads}
              prefix={<UserOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard

