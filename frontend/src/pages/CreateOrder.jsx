import { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Select,
    Button,
    Input,
    InputNumber,
    Table,
    Space,
    Divider,
    Typography,
    message,
    Row,
    Col,
    Descriptions
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    UserOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../services/orders.service.js';
import { customersService } from '../services/customers.service.js';
import { servicesService } from '../services/services.service.js';
import { inventoryService } from '../services/inventory.service.js';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

function CreateOrder() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Data sources
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]);
    const [materials, setMaterials] = useState([]);

    // Order Items State
    const [items, setItems] = useState([]);

    // Totals
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [items]);

    const fetchData = async () => {
        try {
            const [custRes, servRes, matRes] = await Promise.all([
                customersService.getAllCustomers({ limit: 100 }),
                servicesService.getAllServices({ limit: 100 }),
                inventoryService.getAllItems({ limit: 100 })
            ]);
            setCustomers(custRes.customers || []);
            setServices(servRes.services || []);
            // Fix: inventory service returns 'items', not 'materials'
            setMaterials(matRes.items || []);
        } catch (error) {
            console.error('Fetch data error:', error);
            message.error('Lỗi khi tải dữ liệu: ' + (error.message || 'Unknown error'));
        }
    };

    const calculateTotal = () => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalAmount(total);
        form.setFieldsValue({ totalAmount: total });
    };

    const handleAddItem = () => {
        const newItem = {
            key: Date.now(),
            type: 'SERVICE', // Default
            serviceId: null,
            materialId: null,
            productId: null, // For customer product name
            productName: '',
            quantity: 1,
            price: 0,
            notes: ''
        };
        setItems([...items, newItem]);
    };

    const handleRemoveItem = (key) => {
        setItems(items.filter(item => item.key !== key));
    };

    const handleItemChange = (key, field, value) => {
        const newItems = items.map(item => {
            if (item.key === key) {
                const updatedItem = { ...item, [field]: value };

                // Auto-fill price if service/material selected
                if (field === 'serviceId') {
                    const service = services.find(s => s.id === value);
                    if (service) {
                        updatedItem.price = parseFloat(service.price);
                        updatedItem.productName = service.name; // Default product name to service name
                    }
                } else if (field === 'materialId') {
                    // Materials might not have a selling price in this system yet, assuming 0 or manual input
                    // If materials have price, set it here.
                    updatedItem.productName = materials.find(m => m.id === value)?.name || '';
                }

                return updatedItem;
            }
            return item;
        });
        setItems(newItems);
    };

    const handleSubmit = async (values) => {
        if (items.length === 0) {
            message.error('Vui lòng thêm ít nhất 1 sản phẩm/dịch vụ');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                customerId: values.customerId,
                notes: values.notes,
                depositAmount: values.depositAmount || 0,
                type: items.some(i => i.type === 'SERVICE') && items.some(i => i.type === 'RETAIL')
                    ? 'MIXED'
                    : (items[0].type === 'SERVICE' ? 'SERVICE' : 'RETAIL'),
                items: items.map(item => ({
                    productId: null, // We don't have product ID yet, maybe create on fly? For now null.
                    serviceId: item.type === 'SERVICE' ? item.serviceId : null,
                    materialId: item.type === 'RETAIL' ? item.materialId : null,
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.productName + (item.notes ? ` - ${item.notes}` : '') // Combine name and notes
                }))
            };

            await ordersService.createOrder(orderData);
            message.success('Tạo đơn hàng thành công!');
            navigate('/orders');
        } catch (error) {
            message.error('Lỗi khi tạo đơn hàng: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(val) => handleItemChange(record.key, 'type', val)}
                    style={{ width: '100%' }}
                >
                    <Option value="SERVICE">Dịch vụ</Option>
                    <Option value="RETAIL">Mua hàng</Option>
                </Select>
            )
        },
        {
            title: 'Sản phẩm / Dịch vụ',
            key: 'item',
            width: 250,
            render: (_, record) => (
                <Space direction="vertical" style={{ width: '100%' }}>
                    {record.type === 'SERVICE' ? (
                        <Select
                            placeholder="Chọn dịch vụ"
                            style={{ width: '100%' }}
                            value={record.serviceId}
                            onChange={(val) => handleItemChange(record.key, 'serviceId', val)}
                            showSearch
                            optionFilterProp="children"
                        >
                            {services.map(s => (
                                <Option key={s.id} value={s.id}>{s.name} - {parseFloat(s.price).toLocaleString()}đ</Option>
                            ))}
                        </Select>
                    ) : (
                        <Select
                            placeholder="Chọn sản phẩm"
                            style={{ width: '100%' }}
                            value={record.materialId}
                            onChange={(val) => handleItemChange(record.key, 'materialId', val)}
                            showSearch
                            optionFilterProp="children"
                        >
                            {materials.map(m => (
                                <Option key={m.id} value={m.id}>{m.name} (Tồn: {m.quantity})</Option>
                            ))}
                        </Select>
                    )}
                    <Input
                        placeholder="Tên sản phẩm khách gửi (VD: Túi Chanel)"
                        value={record.productName}
                        onChange={(e) => handleItemChange(record.key, 'productName', e.target.value)}
                        style={{ display: record.type === 'SERVICE' ? 'block' : 'none' }}
                    />
                </Space>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (val, record) => (
                <InputNumber
                    min={1}
                    value={val}
                    onChange={(v) => handleItemChange(record.key, 'quantity', v)}
                />
            )
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (val, record) => (
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    value={val}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={(v) => handleItemChange(record.key, 'price', v)}
                />
            )
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: 150,
            render: (_, record) => (
                <Text strong>{(record.price * record.quantity).toLocaleString()} đ</Text>
            )
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(record.key)}
                />
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')} style={{ marginRight: 8 }}>
                    Quay lại
                </Button>
                <Title level={2} style={{ display: 'inline-block', margin: 0 }}>Tạo đơn hàng mới</Title>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={24}>
                    <Col span={16}>
                        <Card title="Danh sách sản phẩm / Dịch vụ" style={{ marginBottom: 24 }}>
                            <Table
                                dataSource={items}
                                columns={columns}
                                pagination={false}
                                rowKey="key"
                                footer={() => (
                                    <Button type="dashed" onClick={handleAddItem} block icon={<PlusOutlined />}>
                                        Thêm dòng
                                    </Button>
                                )}
                            />
                        </Card>

                        <Card title="Ghi chú đơn hàng">
                            <Form.Item name="notes">
                                <TextArea rows={4} placeholder="Ghi chú chung cho đơn hàng..." />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title="Thông tin khách hàng" style={{ marginBottom: 24 }}>
                            <Form.Item
                                name="customerId"
                                label="Khách hàng"
                                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                            >
                                <Select
                                    placeholder="Chọn khách hàng"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {customers.map(c => (
                                        <Option key={c.id} value={c.id}>{c.name} - {c.phone}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Button type="link" icon={<PlusOutlined />} onClick={() => navigate('/customers')}>
                                Tạo khách hàng mới
                            </Button>
                        </Card>

                        <Card title="Thanh toán">
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Tổng tiền hàng">
                                    <Text strong style={{ fontSize: 16 }}>{totalAmount.toLocaleString()} đ</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider style={{ margin: '12px 0' }} />

                            <Form.Item
                                name="depositAmount"
                                label="Tiền đặt cọc"
                                initialValue={0}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={totalAmount}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item shouldUpdate>
                                {() => {
                                    const deposit = form.getFieldValue('depositAmount') || 0;
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                            <Text>Còn lại:</Text>
                                            <Text type="danger" strong style={{ fontSize: 18 }}>
                                                {(totalAmount - deposit).toLocaleString()} đ
                                            </Text>
                                        </div>
                                    );
                                }}
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                icon={<SaveOutlined />}
                                loading={loading}
                                style={{ marginTop: 16 }}
                            >
                                Hoàn tất đơn hàng
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

export default CreateOrder;
