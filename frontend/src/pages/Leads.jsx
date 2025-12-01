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
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { leadsService } from '../services/leads.service.js';
import {
  LEAD_STATUS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_SOURCE,
  LEAD_SOURCE_LABELS,
} from '../constants/leadStatus.js';

const { Option } = Select;

function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined,
    source: undefined,
    search: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form] = Form.useForm();

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await leadsService.getAllLeads(params);
      setLeads(response.leads || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      message.error('Lỗi khi tải danh sách leads: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, filters.status, filters.source]);

  // Handle search
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => fetchLeads(), 300); // Debounce
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle create/edit
  const handleSubmit = async (values) => {
    try {
      if (editingLead) {
        await leadsService.updateLead(editingLead.id, values);
        message.success('Cập nhật lead thành công!');
      } else {
        await leadsService.createLead(values);
        message.success('Tạo lead thành công!');
      }
      setModalVisible(false);
      setEditingLead(null);
      form.resetFields();
      fetchLeads();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await leadsService.deleteLead(id);
      message.success('Xóa lead thành công!');
      fetchLeads();
    } catch (error) {
      message.error('Lỗi khi xóa: ' + (error.response?.data?.error || error.message));
    }
  };

  // Open edit modal
  const handleEdit = (lead) => {
    setEditingLead(lead);
    form.setFieldsValue(lead);
    setModalVisible(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingLead(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      render: (source) => (
        <Tag color="blue">{LEAD_SOURCE_LABELS[source] || source}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={LEAD_STATUS_COLORS[status]}>
          {LEAD_STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'assignedUser',
      key: 'assignedUser',
      render: (user) => user?.name || '-',
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
            onClick={() => navigate(`/leads/${record.id}`)}
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
            title="Bạn có chắc muốn xóa lead này?"
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
          <h2 style={{ margin: 0 }}>Quản lý Leads</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo Lead mới
          </Button>
        </div>

        {/* Filters */}
        <Space className="responsive-filter" style={{ marginBottom: '16px', width: '100%' }} wrap>
          <Input
            className="responsive-input"
            placeholder="Tìm kiếm theo tên, số điện thoại, email..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Select
            className="responsive-select"
            placeholder="Lọc theo trạng thái"
            allowClear
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          >
            {Object.values(LEAD_STATUS).map((status) => (
              <Option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </Option>
            ))}
          </Select>
          <Select
            className="responsive-select"
            placeholder="Lọc theo nguồn"
            allowClear
            value={filters.source}
            onChange={(value) => handleFilterChange('source', value)}
          >
            {Object.values(LEAD_SOURCE).map((source) => (
              <Option key={source} value={source}>
                {LEAD_SOURCE_LABELS[source]}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={leads}
            loading={loading}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} leads`,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, page, limit: pageSize });
              },
            }}
          />
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingLead ? 'Sửa Lead' : 'Tạo Lead mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingLead(null);
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
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input placeholder="Tên lead" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input placeholder="Email (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="source"
            label="Nguồn"
            rules={[{ required: true, message: 'Vui lòng chọn nguồn!' }]}
          >
            <Select placeholder="Chọn nguồn">
              {Object.values(LEAD_SOURCE).map((source) => (
                <Option key={source} value={source}>
                  {LEAD_SOURCE_LABELS[source]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue={LEAD_STATUS.CAN_NHAC}
          >
            <Select>
              {Object.values(LEAD_STATUS).map((status) => (
                <Option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={4} placeholder="Ghi chú về lead..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingLead ? 'Cập nhật' : 'Tạo mới'}
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

export default Leads;

