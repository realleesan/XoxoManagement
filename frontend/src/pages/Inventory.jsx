import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Modal,
  Form,
  message,
  Popconfirm,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { inventoryService } from '../services/inventory.service.js';

const { Option } = Select;

/**
 * Inventory page (Kho & NVL)
 * - Hiện danh sách vật tư/nguyên vật liệu
 * - Cho phép tạo / chỉnh sửa / xóa đơn giản (skeleton)
 * - Gọi các API trong `inventoryService`
 */
function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: '', location: undefined });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const res = await inventoryService.getAllItems(params);
      // Expect response shape similar to other services: { items: [], pagination: { total, page, limit } }
      setItems(res.items || []);
      setPagination(res.pagination || pagination);
    } catch (err) {
      message.error('Lỗi khi tải dữ liệu kho: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.search, filters.location]);

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await inventoryService.deleteItem(id);
      message.success('Xóa vật tư thành công!');
      fetchItems();
    } catch (err) {
      message.error('Lỗi khi xóa: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await inventoryService.updateItem(editingItem.id, values);
        message.success('Cập nhật vật tư thành công!');
      } else {
        await inventoryService.createItem(values);
        message.success('Tạo vật tư thành công!');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      message.error('Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  const columns = [
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'right' },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
    { title: 'Vị trí', dataIndex: 'location', key: 'location' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa mục này?"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Kho & NVL</h2>
          <Space>
            <Input
              placeholder="Tìm kiếm tên hoặc SKU..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Thêm NVL
            </Button>
          </Space>
        </div>

        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={items}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              onChange: (page, pageSize) => setPagination({ ...pagination, page, limit: pageSize }),
            }}
          />
        </div>
      </Card>

      <Modal
        title={editingItem ? 'Sửa vật tư' : 'Tạo vật tư mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên vật tư" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              <Option value="Da">Da</Option>
              <Option value="Chỉ">Chỉ</Option>
              <Option value="Hóa chất">Hóa chất</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị" initialValue="cái">
            <Select>
              <Option value="cái">cái</Option>
              <Option value="kg">kg</Option>
              <Option value="m">m</Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="Vị trí">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Inventory;


