import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Form,
  Select,
  Button,
  message,
  Space,
  Row,
  Col,
  Input,
  InputNumber,
  Upload,
  Image,
  Divider,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { invoicesService } from '../services/invoices.service.js';
import { customersService } from '../services/customers.service.js';
import { productsService } from '../services/products.service.js';
import { servicesService } from '../services/services.service.js';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

function CreateInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Invoice items structure: [{ productId, services: [{ serviceId, quantity, price }], notes, images }]
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Get customerId from location state (if coming from Customer Detail)
  const customerIdFromState = location.state?.customerId;

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchServices();
    if (customerIdFromState) {
      form.setFieldsValue({ customerId: customerIdFromState });
    }
  }, [customerIdFromState, form]);

  const fetchCustomers = async () => {
    try {
      const response = await customersService.getAllCustomers({ limit: 1000 });
      setCustomers(response.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsService.getAllProducts({ limit: 1000 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await servicesService.getAllServices({ limit: 1000 });
      setServices(response.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Add product to invoice
  const handleAddProduct = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: Date.now(),
        productId: undefined,
        services: [],
        notes: '',
        images: [],
      },
    ]);
  };

  // Remove product from invoice
  const handleRemoveProduct = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };

  // Update product selection
  const handleProductChange = (index, productId) => {
    const newItems = [...invoiceItems];
    const product = products.find(p => p.id === productId);
    newItems[index] = {
      ...newItems[index],
      productId,
      productName: product?.name,
    };
    setInvoiceItems(newItems);
  };

  // Add service to product
  const handleAddService = (productIndex) => {
    const newItems = [...invoiceItems];
    newItems[productIndex].services = [
      ...newItems[productIndex].services,
      {
        id: Date.now(),
        serviceId: undefined,
        quantity: 1,
        price: 0,
      },
    ];
    setInvoiceItems(newItems);
  };

  // Remove service from product
  const handleRemoveService = (productIndex, serviceIndex) => {
    const newItems = [...invoiceItems];
    newItems[productIndex].services = newItems[productIndex].services.filter(
      (_, i) => i !== serviceIndex
    );
    setInvoiceItems(newItems);
  };

  // Update service
  const handleServiceChange = (productIndex, serviceIndex, field, value) => {
    const newItems = [...invoiceItems];
    const service = newItems[productIndex].services[serviceIndex];
    
    if (field === 'serviceId') {
      const selectedService = services.find(s => s.id === value);
      service.serviceId = value;
      service.name = selectedService?.name || '';
      service.price = parseFloat(selectedService?.price || 0);
    } else {
      service[field] = value;
    }
    
    setInvoiceItems(newItems);
  };

  // Handle image upload (simplified - in production, upload to cloud storage)
  const handleImageUpload = (productIndex, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newItems = [...invoiceItems];
      newItems[productIndex].images = [...newItems[productIndex].images, e.target.result];
      setInvoiceItems(newItems);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  // Remove image
  const handleRemoveImage = (productIndex, imageIndex) => {
    const newItems = [...invoiceItems];
    newItems[productIndex].images = newItems[productIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setInvoiceItems(newItems);
  };

  // Calculate total
  const calculateTotal = () => {
    let total = 0;
    invoiceItems.forEach(item => {
      item.services.forEach(service => {
        total += parseFloat(service.price || 0) * (service.quantity || 1);
      });
    });
    return total;
  };

  // Handle submit
  const handleSubmit = async (values) => {
    if (invoiceItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm!');
      return;
    }

    // Validate all products have at least one service
    const invalidItems = invoiceItems.filter(
      item => !item.productId || !item.services || item.services.length === 0
    );
    if (invalidItems.length > 0) {
      message.error('Vui lòng chọn sản phẩm và ít nhất một dịch vụ cho mỗi sản phẩm!');
      return;
    }

    setLoading(true);
    try {
      // Flatten items: each service becomes a separate invoice item
      const items = [];
      invoiceItems.forEach(item => {
        item.services.forEach(service => {
          items.push({
            productId: item.productId,
            serviceId: service.serviceId,
            name: service.name || `${item.productName} - ${service.name}`,
            quantity: service.quantity || 1,
            price: parseFloat(service.price || 0),
            notes: item.notes || null,
            images: item.images || [],
          });
        });
      });

      const invoiceData = {
        customerId: values.customerId,
        items,
      };

      const response = await invoicesService.createInvoice(invoiceData);
      message.success('Tạo hóa đơn thành công!');
      const invoiceId = response.data?.invoice?.id || response.invoice?.id;
      if (invoiceId) {
        navigate(`/invoices/${invoiceId}`);
      } else {
        navigate('/invoices');
      }
    } catch (error) {
      message.error('Lỗi khi tạo hóa đơn: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>
            Quay lại
          </Button>
          <Title level={2} style={{ margin: '16px 0 0 0' }}>Tạo Hóa đơn mới</Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerId"
                label="Khách hàng"
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            <Space>
              <span>Sản phẩm & Dịch vụ</span>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
              >
                Thêm sản phẩm
              </Button>
            </Space>
          </Divider>

          {invoiceItems.map((item, productIndex) => (
            <Card
              key={item.id}
              title={`Sản phẩm ${productIndex + 1}`}
              style={{ marginBottom: '16px' }}
              extra={
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveProduct(productIndex)}
                >
                  Xóa
                </Button>
              }
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Chọn sản phẩm">
                    <Select
                      placeholder="Chọn sản phẩm"
                      value={item.productId}
                      onChange={(value) => handleProductChange(productIndex, value)}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {products.map((product) => (
                        <Option key={product.id} value={product.id}>
                          {product.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Services for this product */}
              <Divider orientation="left" style={{ marginTop: '16px' }}>
                <Space>
                  <span>Dịch vụ</span>
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddService(productIndex)}
                    disabled={!item.productId}
                  >
                    Thêm dịch vụ
                  </Button>
                </Space>
              </Divider>

              {item.services.map((service, serviceIndex) => (
                <Card
                  key={service.id}
                  size="small"
                  style={{ marginBottom: '8px' }}
                  extra={
                    <Button
                      danger
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => handleRemoveService(productIndex, serviceIndex)}
                    />
                  }
                >
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item label="Dịch vụ">
                        <Select
                          placeholder="Chọn dịch vụ"
                          value={service.serviceId}
                          onChange={(value) => handleServiceChange(productIndex, serviceIndex, 'serviceId', value)}
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {services.map((s) => (
                            <Option key={s.id} value={s.id}>
                              {s.name} - {formatCurrency(s.price)}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item label="Số lượng">
                        <InputNumber
                          min={1}
                          value={service.quantity}
                          onChange={(value) => handleServiceChange(productIndex, serviceIndex, 'quantity', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item label="Giá">
                        <InputNumber
                          min={0}
                          value={service.price}
                          onChange={(value) => handleServiceChange(productIndex, serviceIndex, 'price', value)}
                          style={{ width: '100%' }}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item label="Thành tiền">
                        <Input
                          value={formatCurrency((service.price || 0) * (service.quantity || 1))}
                          disabled
                          style={{ fontWeight: 'bold' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              {/* Notes */}
              <Form.Item label="Ghi chú cho sản phẩm này">
                <TextArea
                  rows={3}
                  placeholder="Ghi chú đặc biệt, yêu cầu..."
                  value={item.notes}
                  onChange={(e) => {
                    const newItems = [...invoiceItems];
                    newItems[productIndex].notes = e.target.value;
                    setInvoiceItems(newItems);
                  }}
                />
              </Form.Item>

              {/* Images */}
              <Form.Item label="Ảnh sản phẩm (trước khi sửa)">
                <Upload
                  beforeUpload={(file) => {
                    handleImageUpload(productIndex, file);
                    return false;
                  }}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload ảnh</Button>
                </Upload>
                {item.images.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {item.images.map((img, imgIndex) => (
                      <div key={imgIndex} style={{ position: 'relative', display: 'inline-block' }}>
                        <Image
                          src={img}
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <Button
                          danger
                          size="small"
                          icon={<CloseOutlined />}
                          style={{ position: 'absolute', top: 0, right: 0 }}
                          onClick={() => handleRemoveImage(productIndex, imgIndex)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Form.Item>
            </Card>
          ))}

          {/* Total */}
          <Card style={{ marginTop: '24px', background: '#f0f2f5' }}>
            <Row justify="end">
              <Col>
                <Title level={4}>
                  Tổng tiền: <span style={{ color: '#1890ff' }}>{formatCurrency(calculateTotal())}</span>
                </Title>
              </Col>
            </Row>
          </Card>

          <Form.Item style={{ marginTop: '24px' }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Tạo Hóa đơn
              </Button>
              <Button onClick={() => navigate('/invoices')} size="large">
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateInvoice;

