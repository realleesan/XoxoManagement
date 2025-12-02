import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Input,
    Select,
    Space,
    Tag,
    message,
    Popconfirm,
    DatePicker,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    DeleteOutlined,
    ShoppingOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../services/orders.service.js';
import { format } from 'date-fns';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ORDER_STATUS = {
    PENDING: { label: 'Mới', color: 'blue' },
    DEPOSITED: { label: 'Đã cọc', color: 'cyan' },
    PROCESSING: { label: 'Đang xử lý', color: 'orange' },
    COMPLETED: { label: 'Hoàn thành', color: 'green' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
};

const ORDER_TYPE = {
    SERVICE: { label: 'Dịch vụ', color: 'purple' },
    RETAIL: { label: 'Bán lẻ', color: 'magenta' },
    MIXED: { label: 'Hỗn hợp', color: 'geekblue' },
};

function Orders() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [filters, setFilters] = useState({ status: undefined, search: '', range: [null, null] });
    const [stats, setStats] = useState({ total: 0, revenue: 0 });

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status,
                search: filters.search,
                startDate: filters.range[0] ? filters.range[0].toISOString() : undefined,
                endDate: filters.range[1] ? filters.range[1].toISOString() : undefined,
            };
            const res = await ordersService.getAllOrders(params);
            setOrders(res.orders || []);
            setPagination(res.pagination || pagination);

            // Calculate simple stats from current page (in real app, should fetch from backend)
            const totalRevenue = (res.orders || []).reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
            setStats({ total: res.pagination.total, revenue: totalRevenue });
        } catch (error) {
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, page: 1 });
    };

    const handleDelete = async (id) => {
        try {
            await ordersService.deleteOrder(id);
            message.success('Xóa đơn hàng thành công');
            fetchOrders();
        } catch (error) {
            message.error('Lỗi khi xóa đơn hàng');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <a>{text.slice(0, 8)}...</a>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text, record) => (
                <div>
                    <div>{text}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.customerPhone}</div>
                </div>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={ORDER_TYPE[type]?.color}>{ORDER_TYPE[type]?.label || type}</Tag>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right',
            render: (amount) => formatCurrency(amount),
        },
        {
            title: 'Đã cọc',
            dataIndex: 'depositAmount',
            key: 'depositAmount',
            align: 'right',
            render: (amount) => formatCurrency(amount),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={ORDER_STATUS[status]?.color}>{ORDER_STATUS[status]?.label || status}</Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/orders/${record.id}`)}
                    >
                        Xem
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa đơn hàng này?"
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
                {/* Header */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Quản lý Đơn hàng</h2>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/create')}>
                        Tạo đơn hàng
                    </Button>
                </div>

                {/* Summary Cards */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Card size="small" style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}>
                            <Statistic
                                title="Tổng đơn hàng"
                                value={stats.total}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                            <Statistic
                                title="Doanh thu (Trang này)"
                                value={stats.revenue}
                                precision={0}
                                prefix={<DollarOutlined />}
                                formatter={(value) => formatCurrency(value)}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Space className="responsive-filter" style={{ marginBottom: '16px', width: '100%' }} wrap>
                    <Input
                        placeholder="Tìm kiếm khách hàng..."
                        prefix={<SearchOutlined />}
                        style={{ width: 200 }}
                        allowClear
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <Select
                        placeholder="Trạng thái"
                        style={{ width: 150 }}
                        allowClear
                        onChange={(v) => handleFilterChange('status', v)}
                    >
                        {Object.entries(ORDER_STATUS).map(([key, val]) => (
                            <Option key={key} value={key}>{val.label}</Option>
                        ))}
                    </Select>
                    <RangePicker
                        format="DD/MM/YYYY"
                        onChange={(dates) => handleFilterChange('range', dates || [null, null])}
                    />
                    <Button icon={<SearchOutlined />} onClick={fetchOrders}>
                        Lọc
                    </Button>
                </Space>

                {/* Table */}
                <div className="responsive-table">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        loading={loading}
                        rowKey="id"
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: pagination.page,
                            pageSize: pagination.limit,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} đơn hàng`,
                            onChange: (page, pageSize) => setPagination({ ...pagination, page, limit: pageSize }),
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}

export default Orders;
