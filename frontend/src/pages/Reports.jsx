import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Table,
  Statistic,
  Spin,
  Alert,
  Typography,
  Space,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/format.js';
import { reportsService } from '../services/reports.service.js';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

// Color palette for charts
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [groupBy, setGroupBy] = useState('day');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [dateRange, groupBy]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: dateRange[0].startOf('day').toISOString(),
        endDate: dateRange[1].endOf('day').toISOString(),
        groupBy,
      };

      const data = await reportsService.getComprehensive(params);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.error || err.message || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement Excel export
    alert('Tính năng export Excel sẽ được thêm sau');
  };

  if (loading && !reportData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải báo cáo...</p>
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
          onClose={() => setError(null)}
        />
      </div>
    );
  }

  const { summary = {}, revenueReport = [], topProducts = [], topServices = [], topCustomers = [], newCustomers = [] } = reportData || {};

  // Prepare data for charts
  const revenueChartData = revenueReport.map(item => ({
    period: item.period,
    revenue: item.revenue,
    invoices: item.invoiceCount,
  }));

  const topProductsChartData = topProducts.map(item => ({
    name: item.productName,
    value: item.totalRevenue,
  }));

  const topServicesChartData = topServices.map(item => ({
    name: item.serviceName,
    value: item.totalRevenue,
  }));

  const newCustomersChartData = newCustomers.map(item => ({
    date: item.date,
    count: item.count,
  }));

  // Table columns
  const productsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lần sử dụng',
      dataIndex: 'usageCount',
      key: 'usageCount',
      align: 'center',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
  ];

  const servicesColumns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số lần sử dụng',
      dataIndex: 'usageCount',
      key: 'usageCount',
      align: 'center',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
  ];

  const customersColumns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
      align: 'center',
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Báo cáo & Phân tích</Title>
        <Space className="responsive-filter">
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates || [dayjs().subtract(30, 'day'), dayjs()])}
            format="DD/MM/YYYY"
          />
          <Select
            className="responsive-select"
            value={groupBy}
            onChange={setGroupBy}
          >
            <Option value="day">Theo ngày</Option>
            <Option value="week">Theo tuần</Option>
            <Option value="month">Theo tháng</Option>
            <Option value="year">Theo năm</Option>
          </Select>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={summary.totalRevenue || 0}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hóa đơn"
              value={summary.totalInvoices || 0}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng mới"
              value={summary.totalNewCustomers || 0}
              prefix={<UserOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giá trị TB hóa đơn"
              value={summary.averageInvoiceValue || 0}
              prefix={<ShoppingOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Card title="Biểu đồ Doanh thu" style={{ marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#1890ff"
              strokeWidth={2}
              name="Doanh thu"
            />
            <Line
              type="monotone"
              dataKey="invoices"
              stroke="#52c41a"
              strokeWidth={2}
              name="Số hóa đơn"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card title="Top Sản phẩm" style={{ marginBottom: '24px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#1890ff" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
            <div className="responsive-table">
              <Table
                dataSource={topProducts}
                columns={productsColumns}
                rowKey="productId"
                pagination={false}
                size="small"
                style={{ marginTop: '16px' }}
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </Col>

        {/* Top Services */}
        <Col xs={24} lg={12}>
          <Card title="Top Dịch vụ" style={{ marginBottom: '24px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topServicesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topServicesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="responsive-table">
              <Table
                dataSource={topServices}
                columns={servicesColumns}
                rowKey="serviceId"
                pagination={false}
                size="small"
                style={{ marginTop: '16px' }}
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </Col>

        {/* Top Customers */}
        <Col xs={24}>
          <Card title="Top Khách hàng">
            <div className="responsive-table">
              <Table
                dataSource={topCustomers}
                columns={customersColumns}
                rowKey="customerId"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </Col>

        {/* New Customers Chart */}
        {newCustomersChartData.length > 0 && (
          <Col xs={24}>
            <Card title="Khách hàng mới theo ngày">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={newCustomersChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#52c41a" name="Số khách hàng mới" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default Reports;

