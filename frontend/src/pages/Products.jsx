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
  message,
  Popconfirm,
  Image,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { productsService } from '../services/products.service.js';
import { customersService } from '../services/customers.service.js';
import {
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_COLORS,
} from '../constants/productStatus.js';

const { Option } = Select;

function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    customerId: location.state?.customerId || undefined,
    status: undefined,
    search: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Fetch customers for filter
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customersService.getAllCustomers({ limit: 1000 });
        setCustomers(response.customers || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await productsService.getAllProducts(params);
      setProducts(response.products || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status, filters.customerId]);

  // Handle search
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => fetchProducts(), 300); // Debounce
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle create/edit
  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, values);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await productsService.createProduct(values);
        message.success('Tạo sản phẩm thành công!');
      }
      setModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await productsService.deleteProduct(id);
      message.success('Xóa sản phẩm thành công!');
      fetchProducts();
    } catch (error) {
      message.error('Lỗi khi xóa: ' + (error.response?.data?.error || error.message));
    }
  };

  // Open edit modal
  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      images: product.images || [],
    });
    setModalVisible(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    if (filters.customerId) {
      form.setFieldsValue({ customerId: filters.customerId });
    }
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => customer?.name || '-',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={PRODUCT_STATUS_COLORS[status]}>
          {PRODUCT_STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images) => {
        if (!images || images.length === 0) return '-';
        return (
          <Image.PreviewGroup>
            <Image
              src={images[0]}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />
          </Image.PreviewGroup>
        );
      },
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
            onClick={() => navigate(`/products/${record.id}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
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
          <h2 style={{ margin: 0 }}>Quản lý Sản phẩm</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo Sản phẩm mới
          </Button>
        </div>

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
            placeholder="Lọc theo khách hàng"
            allowClear
            value={filters.customerId}
            onChange={(value) => handleFilterChange('customerId', value)}
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {customers.map((customer) => (
              <Option key={customer.id} value={customer.id}>
                {customer.name}
              </Option>
            ))}
          </Select>
          <Select
            className="responsive-select"
            placeholder="Lọc theo trạng thái"
            allowClear
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          >
            {Object.values(PRODUCT_STATUS).map((status) => (
              <Option key={status} value={status}>
                {PRODUCT_STATUS_LABELS[status]}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={products}
            loading={loading}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, page, limit: pageSize });
              },
            }}
          />
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProduct ? 'Sửa Sản phẩm' : 'Tạo Sản phẩm mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
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
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Mô tả sản phẩm..." />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue={PRODUCT_STATUS.DANG_LAM}
          >
            <Select>
              {Object.values(PRODUCT_STATUS).map((status) => (
                <Option key={status} value={status}>
                  {PRODUCT_STATUS_LABELS[status]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="images"
            label="URLs ảnh (phân cách bằng dấu phẩy)"
            help="Nhập các URL ảnh, phân cách bằng dấu phẩy"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              onChange={(e) => {
                const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
                form.setFieldsValue({ images: urls });
              }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Cập nhật' : 'Tạo mới'}
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

export default Products;

