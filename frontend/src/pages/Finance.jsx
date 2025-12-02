import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Select,
  Button,
  DatePicker,
  Statistic,
  Space,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Descriptions,
  Divider,
} from 'antd';
import {
  DownloadOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { financeService } from '../services/finance.service.js';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// Transaction Type & Status Constants
const TRANSACTION_TYPES = {
  REVENUE: { label: 'Doanh thu', color: 'green' },
  EXPENSE: { label: 'Chi phí', color: 'red' },
};

const TRANSACTION_STATUS = {
  PENDING: { label: 'Chờ duyệt', color: 'orange' },
  APPROVED: { label: 'Đã duyệt', color: 'blue' },
  REJECTED: { label: 'Từ chối', color: 'red' },
  PAID: { label: 'Đã thanh toán', color: 'green' },
};

function Finance() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ type: undefined, status: undefined, range: [null, null] });
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpense: 0 });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.type, filters.status, filters.range]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type,
        status: filters.status,
        startDate: filters.range[0] ? filters.range[0].toISOString() : undefined,
        endDate: filters.range[1] ? filters.range[1].toISOString() : undefined,
      };
      const res = await financeService.getAllTransactions(params);
      setTransactions(res.transactions || []);
      setPagination(res.pagination || pagination);
      setSummary(res.summary || { totalRevenue: 0, totalExpense: 0 });
    } catch (err) {
      message.error('Lỗi khi tải giao dịch: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  // Create Transaction
  const handleCreate = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (values) => {
    try {
      await financeService.createTransaction(values);
      message.success('Tạo giao dịch thành công!');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchTransactions();
    } catch (err) {
      message.error('Lỗi khi tạo giao dịch: ' + (err.response?.data?.error || err.message));
    }
  };

  // View Transaction
  const handleView = (record) => {
    setSelectedTransaction(record);
    setIsViewModalOpen(true);
  };

  // Edit Transaction
  const handleEdit = (record) => {
    setSelectedTransaction(record);
    editForm.setFieldsValue({
      type: record.type,
      amount: record.amount,
      description: record.description,
      status: record.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      await financeService.updateTransaction(selectedTransaction.id, values);
      message.success('Cập nhật giao dịch thành công!');
      setIsEditModalOpen(false);
      editForm.resetFields();
      fetchTransactions();
    } catch (err) {
      message.error('Lỗi khi cập nhật giao dịch: ' + (err.response?.data?.error || err.message));
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      // Prepare data for export
      const exportData = transactions.map((t) => ({
        'Mã giao dịch': t.id,
        'Loại': TRANSACTION_TYPES[t.type]?.label || t.type,
        'Số tiền': t.amount,
        'Trạng thái': TRANSACTION_STATUS[t.status]?.label || t.status,
        'Mô tả': t.description || '',
        'Ngày tạo': format(new Date(t.createdAt), 'dd/MM/yyyy HH:mm'),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Mã giao dịch
        { wch: 15 }, // Loại
        { wch: 15 }, // Số tiền
        { wch: 15 }, // Trạng thái
        { wch: 40 }, // Mô tả
        { wch: 20 }, // Ngày tạo
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Giao dịch');

      // Add summary sheet
      const summaryData = [
        { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': summary.totalRevenue },
        { 'Chỉ số': 'Tổng chi phí', 'Giá trị': summary.totalExpense },
        { 'Chỉ số': 'Lợi nhuận', 'Giá trị': summary.totalRevenue - summary.totalExpense },
        { 'Chỉ số': 'Tổng giao dịch', 'Giá trị': pagination.total },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');

      // Generate filename with current date
      const filename = `BaoCaoTaiChinh_${format(new Date(), 'ddMMyyyy_HHmmss')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      message.success('Xuất Excel thành công!');
    } catch (err) {
      message.error('Lỗi khi xuất Excel: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={TRANSACTION_TYPES[type]?.color}>
          {TRANSACTION_TYPES[type]?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 150,
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={TRANSACTION_STATUS[status]?.color}>
          {TRANSACTION_STATUS[status]?.label || status}
        </Tag>
      ),
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
      width: 160,
      render: (v) => (v ? format(new Date(v), 'dd/MM/yyyy HH:mm') : '-'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Quản lý Tài chính</h2>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Tạo giao dịch
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
          </Space>
        </div>

        {/* Summary Cards */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Statistic
                title="Tổng doanh thu"
                value={summary.totalRevenue || 0}
                precision={0}
                valueStyle={{ color: '#3f8600', fontSize: '20px' }}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ backgroundColor: '#fff1f0', border: '1px solid #ffa39e' }}>
              <Statistic
                title="Tổng chi phí"
                value={summary.totalExpense || 0}
                precision={0}
                valueStyle={{ color: '#cf1322', fontSize: '20px' }}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              size="small"
              style={{
                backgroundColor: (summary.totalRevenue - summary.totalExpense) >= 0 ? '#f6ffed' : '#fff1f0',
                border: (summary.totalRevenue - summary.totalExpense) >= 0 ? '1px solid #b7eb8f' : '1px solid #ffa39e'
              }}
            >
              <Statistic
                title="Lợi nhuận"
                value={(summary.totalRevenue || 0) - (summary.totalExpense || 0)}
                precision={0}
                valueStyle={{
                  color: (summary.totalRevenue - summary.totalExpense) >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: '20px'
                }}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}>
              <Statistic
                title="Tổng giao dịch"
                value={pagination.total || 0}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Space className="responsive-filter" style={{ marginBottom: '16px', width: '100%' }} wrap>
          <Select
            className="responsive-select"
            placeholder="Loại giao dịch"
            style={{ width: 160 }}
            allowClear
            onChange={(v) => handleFilterChange('type', v)}
          >
            <Option value="REVENUE">Doanh thu</Option>
            <Option value="EXPENSE">Chi phí</Option>
          </Select>
          <Select
            className="responsive-select"
            placeholder="Trạng thái"
            style={{ width: 160 }}
            allowClear
            onChange={(v) => handleFilterChange('status', v)}
          >
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
            <Option value="PAID">Đã thanh toán</Option>
          </Select>
          <RangePicker
            format="DD/MM/YYYY"
            onChange={(dates) => handleFilterChange('range', dates || [null, null])}
          />
          <Button icon={<SearchOutlined />} onClick={() => fetchTransactions()}>
            Lọc
          </Button>
        </Space>

        {/* Table */}
        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={transactions}
            loading={loading}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} giao dịch`,
              onChange: (page, pageSize) => setPagination({ ...pagination, page, limit: pageSize }),
            }}
          />
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        title="Tạo giao dịch mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item
            name="type"
            label="Loại giao dịch"
            rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch' }]}
          >
            <Select placeholder="Chọn loại">
              <Option value="REVENUE">Doanh thu</Option>
              <Option value="EXPENSE">Chi phí</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập số tiền"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả giao dịch" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="PENDING"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Từ chối</Option>
              <Option value="PAID">Đã thanh toán</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Tạo giao dịch
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Chi tiết giao dịch"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalOpen(false);
              handleEdit(selectedTransaction);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={700}
      >
        {selectedTransaction && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã giao dịch">{selectedTransaction.id}</Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color={TRANSACTION_TYPES[selectedTransaction.type]?.color}>
                {TRANSACTION_TYPES[selectedTransaction.type]?.label || selectedTransaction.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <strong style={{ fontSize: '16px' }}>{formatCurrency(selectedTransaction.amount)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={TRANSACTION_STATUS[selectedTransaction.status]?.color}>
                {TRANSACTION_STATUS[selectedTransaction.status]?.label || selectedTransaction.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedTransaction.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {format(new Date(selectedTransaction.createdAt), 'dd/MM/yyyy HH:mm:ss')}
            </Descriptions.Item>
            {selectedTransaction.updatedAt && (
              <Descriptions.Item label="Cập nhật lần cuối">
                {format(new Date(selectedTransaction.updatedAt), 'dd/MM/yyyy HH:mm:ss')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa giao dịch"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="type"
            label="Loại giao dịch"
            rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch' }]}
          >
            <Select placeholder="Chọn loại">
              <Option value="REVENUE">Doanh thu</Option>
              <Option value="EXPENSE">Chi phí</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập số tiền"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả giao dịch" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Từ chối</Option>
              <Option value="PAID">Đã thanh toán</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Finance;
