import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { servicesService } from '../services/services.service.js';
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_COLORS,
} from '../constants/serviceCategories.js';

const { Option } = Select;

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
  });
  const [filters, setFilters] = useState({
    category: undefined,
    search: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    total: 0,
    byCategory: {},
  });

  // Fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await servicesService.getAllServices(params);
      setServices(response.services || []);
      setPagination(response.pagination || pagination);
      
      // Calculate statistics
      const stats = {
        total: response.pagination?.total || 0,
        byCategory: {},
      };
      (response.services || []).forEach(service => {
        stats.byCategory[service.category] = (stats.byCategory[service.category] || 0) + 1;
      });
      setStatistics(stats);
    } catch (error) {
      message.error('Lỗi khi tải danh sách dịch vụ: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.category]);

  // Handle search
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => fetchServices(), 300); // Debounce
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle create/edit
  const handleSubmit = async (values) => {
    try {
      if (editingService) {
        await servicesService.updateService(editingService.id, values);
        message.success('Cập nhật dịch vụ thành công!');
      } else {
        await servicesService.createService(values);
        message.success('Tạo dịch vụ thành công!');
      }
      setModalVisible(false);
      setEditingService(null);
      form.resetFields();
      fetchServices();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await servicesService.deleteService(id);
      message.success('Xóa dịch vụ thành công!');
      fetchServices();
    } catch (error) {
      message.error('Lỗi khi xóa: ' + (error.response?.data?.error || error.message));
    }
  };

  // Open edit modal
  const handleEdit = (service) => {
    setEditingService(service);
    form.setFieldsValue({
      ...service,
      price: parseFloat(service.price),
    });
    setModalVisible(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingService(null);
    form.resetFields();
    setModalVisible(true);
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
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={SERVICE_CATEGORY_COLORS[category] || 'default'}>
          {SERVICE_CATEGORY_LABELS[category] || category}
        </Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa dịch vụ này?"
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
          <h2 style={{ margin: 0 }}>Quản lý Dịch vụ</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo Dịch vụ mới
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng dịch vụ"
                value={statistics.total}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          {Object.entries(statistics.byCategory).map(([category, count]) => (
            <Col xs={24} sm={12} lg={6} key={category}>
              <Card>
                <Statistic
                  title={SERVICE_CATEGORY_LABELS[category] || category}
                  value={count}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Space className="responsive-filter" style={{ marginBottom: '16px', width: '100%' }} wrap>
          <Input
            className="responsive-input"
            placeholder="Tìm kiếm theo tên, mô tả..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Select
            className="responsive-select"
            placeholder="Lọc theo danh mục"
            allowClear
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
          >
            {Object.values(SERVICE_CATEGORIES).map((category) => (
              <Option key={category} value={category}>
                {SERVICE_CATEGORY_LABELS[category]}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={services}
            loading={loading}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} dịch vụ`,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, page, limit: pageSize });
              },
            }}
          />
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingService ? 'Sửa Dịch vụ' : 'Tạo Dịch vụ mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingService(null);
          form.resetFields();
        }}
        footer={null}
        style={{ maxWidth: '92vw' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
          >
            <Input placeholder="Tên dịch vụ" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {Object.values(SERVICE_CATEGORIES).map((category) => (
                <Option key={category} value={category}>
                  {SERVICE_CATEGORY_LABELS[category]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VND)"
            rules={[
              { required: true, message: 'Vui lòng nhập giá!' },
              { type: 'number', min: 0, message: 'Giá phải lớn hơn 0!' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập giá dịch vụ"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Mô tả dịch vụ..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingService ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Services;

