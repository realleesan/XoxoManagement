import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Select,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Row,
  Col,
  Statistic,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { workflowsService } from '../services/workflows.service.js';
import {
  WORKFLOW_STATUS,
  WORKFLOW_STATUS_LABELS,
  WORKFLOW_STATUS_COLORS,
} from '../constants/workflowStatus.js';
import { productsService } from '../services/products.service.js';

const { Option } = Select;

function Workflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined,
    productId: undefined,
  });
  const [products, setProducts] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {},
  });

  // Fetch workflows
  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await workflowsService.getAllWorkflows(params);
      setWorkflows(response.workflows || []);
      setPagination(response.pagination || pagination);
      
      // Calculate statistics
      const stats = {
        total: response.pagination?.total || 0,
        byStatus: {},
      };
      (response.workflows || []).forEach(workflow => {
        stats.byStatus[workflow.status] = (stats.byStatus[workflow.status] || 0) + 1;
      });
      setStatistics(stats);
    } catch (error) {
      message.error('Lỗi khi tải danh sách quy trình: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for filter
  const fetchProducts = async () => {
    try {
      const response = await productsService.getAllProducts({ limit: 1000 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status, filters.productId]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await workflowsService.deleteWorkflow(id);
      message.success('Xóa quy trình thành công!');
      fetchWorkflows();
    } catch (error) {
      message.error('Lỗi khi xóa: ' + (error.response?.data?.error || error.message));
    }
  };

  // View workflow detail (navigate to Kanban)
  const handleView = (id) => {
    navigate(`/workflows/${id}`);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên quy trình',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.productName || '-'}</div>
          {record.customerName && (
            <div style={{ fontSize: '12px', color: '#666' }}>KH: {record.customerName}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={WORKFLOW_STATUS_COLORS[status] || 'default'}>
          {WORKFLOW_STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Giai đoạn hiện tại',
      dataIndex: 'currentStage',
      key: 'currentStage',
      render: (currentStage, record) => {
        if (!currentStage && record.stages && record.stages.length > 0) {
          const currentStageObj = record.stages.find(s => s.status === 'IN_PROGRESS');
          return currentStageObj ? currentStageObj.name : record.stages[0]?.name || '-';
        }
        return currentStage || '-';
      },
    },
    {
      title: 'Số giai đoạn',
      key: 'stagesCount',
      render: (_, record) => (
        <Badge count={record.stages?.length || 0} showZero />
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
            onClick={() => handleView(record.id)}
          >
            Xem
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa quy trình này?"
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
          <h2 style={{ margin: 0 }}>Quản lý Quy trình Sửa chữa</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/workflows/create')}
          >
            Tạo Quy trình mới
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng quy trình"
                value={statistics.total}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          {Object.entries(statistics.byStatus).map(([status, count]) => (
            <Col xs={24} sm={12} lg={6} key={status}>
              <Card>
                <Statistic
                  title={WORKFLOW_STATUS_LABELS[status] || status}
                  value={count}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Space style={{ marginBottom: '16px', width: '100%' }} wrap>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          >
            {Object.values(WORKFLOW_STATUS).map((status) => (
              <Option key={status} value={status}>
                {WORKFLOW_STATUS_LABELS[status]}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo sản phẩm"
            style={{ width: 250 }}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={filters.productId}
            onChange={(value) => handleFilterChange('productId', value)}
          >
            {products.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={workflows}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} quy trình`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, page, limit: pageSize });
            },
          }}
        />
      </Card>
    </div>
  );
}

export default Workflows;

