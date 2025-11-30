import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  DollarOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { invoicesService } from '../services/invoices.service.js';
import {
  INVOICE_STATUS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '../constants/invoiceStatus.js';

const { Option } = Select;

function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined,
    search: '',
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    totalAmount: 0,
    byStatus: {},
  });

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await invoicesService.getAllInvoices(params);
      setInvoices(response.invoices || []);
      setPagination(response.pagination || pagination);
      
      // Calculate statistics
      const stats = {
        total: response.pagination?.total || 0,
        totalAmount: 0,
        byStatus: {},
      };
      (response.invoices || []).forEach(invoice => {
        stats.totalAmount += parseFloat(invoice.totalAmount || 0);
        stats.byStatus[invoice.status] = (stats.byStatus[invoice.status] || 0) + 1;
      });
      setStatistics(stats);
    } catch (error) {
      message.error('Lỗi khi tải danh sách hóa đơn: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status]);

  // Handle search
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => fetchInvoices(), 300); // Debounce
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await invoicesService.deleteInvoice(id);
      message.success('Xóa hóa đơn thành công!');
      fetchInvoices();
    } catch (error) {
      message.error('Lỗi khi xóa: ' + (error.response?.data?.error || error.message));
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Table columns
  const columns = [
    {
      title: 'Số HĐ',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customerName || '-'}</div>
          {record.customerPhone && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.customerPhone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
    },
    {
      title: 'Số items',
      dataIndex: 'itemsCount',
      key: 'itemsCount',
      render: (count) => count || 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={INVOICE_STATUS_COLORS[status] || 'default'}>
          {INVOICE_STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/${record.id}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            In
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa hóa đơn này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Quản lý Hóa đơn</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/invoices/create')}>
            Tạo Hóa đơn mới
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng hóa đơn"
                value={statistics.total}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={statistics.totalAmount}
                prefix={<DollarOutlined />}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          {Object.entries(statistics.byStatus).map(([status, count]) => (
            <Col xs={24} sm={12} lg={6} key={status}>
              <Card>
                <Statistic
                  title={INVOICE_STATUS_LABELS[status] || status}
                  value={count}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Space style={{ marginBottom: '16px', width: '100%' }} wrap>
          <Input
            placeholder="Tìm kiếm theo số HĐ, tên KH..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          >
            {Object.values(INVOICE_STATUS).map((status) => (
              <Option key={status} value={status}>
                {INVOICE_STATUS_LABELS[status]}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={invoices}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, page, limit: pageSize });
            },
          }}
        />
      </Card>
    </div>
  );
}

export default Invoices;

