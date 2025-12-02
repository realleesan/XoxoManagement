import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Descriptions,
    Table,
    Tag,
    Button,
    Space,
    Typography,
    Divider,
    message,
    Select,
    Row,
    Col,
    Spin
} from 'antd';
import {
    ArrowLeftOutlined,
    PrinterOutlined,
    EditOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { ordersService } from '../services/orders.service.js';
import { format } from 'date-fns';

const { Title, Text } = Typography;
const { Option } = Select;

const ORDER_STATUS = {
    PENDING: { label: 'Mới', color: 'blue', icon: <SyncOutlined spin /> },
    DEPOSITED: { label: 'Đã cọc', color: 'cyan', icon: <CheckCircleOutlined /> },
    PROCESSING: { label: 'Đang xử lý', color: 'orange', icon: <SyncOutlined spin /> },
    COMPLETED: { label: 'Hoàn thành', color: 'green', icon: <CheckCircleOutlined /> },
    CANCELLED: { label: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
};

const ORDER_TYPE = {
    SERVICE: { label: 'Dịch vụ', color: 'purple' },
    RETAIL: { label: 'Bán lẻ', color: 'magenta' },
    MIXED: { label: 'Hỗn hợp', color: 'geekblue' },
};

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await ordersService.getOrderById(id);
            setOrder(data);
        } catch (error) {
            message.error('Lỗi khi tải thông tin đơn hàng');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await ordersService.updateOrderStatus(id, newStatus);
            message.success('Cập nhật trạng thái thành công');
            fetchOrder();
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    const columns = [
        {
            title: 'Sản phẩm / Dịch vụ',
            key: 'name',
            render: (_, record) => (
                <div>
                    <Text strong>{record.serviceName || record.materialName || record.productName || 'Sản phẩm'}</Text>
                    {record.notes && <div style={{ fontSize: '12px', color: '#888' }}>{record.notes}</div>}
                </div>
            ),
        },
        {
            title: 'Loại',
            key: 'type',
            render: (_, record) => (
                <Tag>{record.serviceId ? 'Dịch vụ' : 'Sản phẩm'}</Tag>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (val) => parseFloat(val).toLocaleString() + ' đ',
        },
        {
            title: 'Thành tiền',
            key: 'total',
            align: 'right',
            render: (_, record) => (
                <Text strong>{(parseFloat(record.price) * record.quantity).toLocaleString()} đ</Text>
            ),
        },
    ];

    if (loading) return <div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>;
    if (!order) return null;

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
                        Quay lại
                    </Button>
                    <Title level={3} style={{ margin: 0 }}>Đơn hàng #{order.id.slice(0, 8)}</Title>
                    <Tag color={ORDER_TYPE[order.type]?.color}>{ORDER_TYPE[order.type]?.label}</Tag>
                    <Tag color={ORDER_STATUS[order.status]?.color} icon={ORDER_STATUS[order.status]?.icon}>
                        {ORDER_STATUS[order.status]?.label}
                    </Tag>
                </Space>
                <Space>
                    <Button icon={<PrinterOutlined />}>In phiếu</Button>
                    {/* <Button type="primary" icon={<EditOutlined />}>Sửa</Button> */}
                </Space>
            </div>

            <Row gutter={24}>
                <Col span={16}>
                    {/* Order Items */}
                    <Card title="Chi tiết đơn hàng" style={{ marginBottom: 24 }}>
                        <Table
                            dataSource={order.items}
                            columns={columns}
                            pagination={false}
                            rowKey="id"
                        />
                    </Card>

                    {/* Notes */}
                    <Card title="Ghi chú">
                        <Text>{order.notes || 'Không có ghi chú'}</Text>
                    </Card>
                </Col>

                <Col span={8}>
                    {/* Customer Info */}
                    <Card title="Thông tin khách hàng" style={{ marginBottom: 24 }}>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Tên">{order.customerName}</Descriptions.Item>
                            <Descriptions.Item label="SĐT">{order.customerPhone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{order.customerEmail || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">{order.customerAddress || '-'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Payment Info */}
                    <Card title="Thanh toán" style={{ marginBottom: 24 }}>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong>{parseFloat(order.totalAmount).toLocaleString()} đ</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đã cọc">
                                <Text type="success">{parseFloat(order.depositAmount).toLocaleString()} đ</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Còn lại">
                                <Text type="danger" strong style={{ fontSize: 16 }}>
                                    {(parseFloat(order.totalAmount) - parseFloat(order.depositAmount)).toLocaleString()} đ
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Actions */}
                    <Card title="Cập nhật trạng thái">
                        <Select
                            style={{ width: '100%', marginBottom: 16 }}
                            value={order.status}
                            onChange={handleStatusChange}
                            loading={updating}
                        >
                            {Object.entries(ORDER_STATUS).map(([key, val]) => (
                                <Option key={key} value={key}>{val.label}</Option>
                            ))}
                        </Select>

                        {order.type !== 'RETAIL' && (
                            <Button type="primary" block onClick={() => navigate(`/workflows/create?orderId=${order.id}`)}>
                                Tạo quy trình sửa chữa
                            </Button>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default OrderDetail;
