import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Table,
  Image,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { invoicesService } from '../services/invoices.service.js';
import {
  INVOICE_STATUS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '../constants/invoiceStatus.js';

const { Title, Text } = Typography;
const { Option } = Select;

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await invoicesService.getInvoiceById(id);
      setInvoice(response.invoice);
    } catch (error) {
      message.error('Lỗi khi tải hóa đơn: ' + (error.response?.data?.error || error.message));
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await invoicesService.updateInvoice(id, { status });
      message.success('Cập nhật trạng thái thành công!');
      fetchInvoice();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading || !invoice) {
    return <div style={{ padding: '24px' }}>Đang tải...</div>;
  }

  // Group items by product
  const itemsByProduct = {};
  invoice.items?.forEach(item => {
    const productId = item.productId || 'no-product';
    if (!itemsByProduct[productId]) {
      itemsByProduct[productId] = {
        productId: item.productId,
        productName: item.productName,
        productImages: Array.isArray(item.productImages) ? item.productImages : [],
        items: [],
        notes: item.notes,
        images: Array.isArray(item.images) ? item.images : [],
      };
    }
    itemsByProduct[productId].items.push(item);
  });

  // Table columns for items
  const itemColumns = [
    {
      title: 'Dịch vụ',
      key: 'service',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.serviceName || record.name}</div>
          {record.serviceCategory && (
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.serviceCategory}</Text>
          )}
        </div>
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
      render: (price) => formatCurrency(price),
      align: 'right',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_, record) => formatCurrency(parseFloat(record.price) * record.quantity),
      align: 'right',
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>
              Quay lại
            </Button>
            <div>
              <Title level={2} style={{ margin: 0 }}>Hóa đơn #{invoice.invoiceNo}</Title>
              <Text type="secondary">
                Khách hàng: {invoice.customerName} | {invoice.customerPhone}
              </Text>
            </div>
          </Space>
          <Space>
            <Select
              value={invoice.status}
              onChange={handleStatusChange}
              style={{ width: 150 }}
            >
              {Object.values(INVOICE_STATUS).map((status) => (
                <Option key={status} value={status}>
                  {INVOICE_STATUS_LABELS[status]}
                </Option>
              ))}
            </Select>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              In
            </Button>
            <Button icon={<DownloadOutlined />}>
              Export PDF
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Invoice Info */}
      <Card style={{ marginBottom: '16px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Số hóa đơn">{invoice.invoiceNo}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={INVOICE_STATUS_COLORS[invoice.status]}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng" span={2}>
            {invoice.customerName}
            {invoice.customerPhone && ` - ${invoice.customerPhone}`}
            {invoice.customerEmail && ` - ${invoice.customerEmail}`}
          </Descriptions.Item>
          {invoice.customerAddress && (
            <Descriptions.Item label="Địa chỉ" span={2}>
              {invoice.customerAddress}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ngày tạo">
            {new Date(invoice.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {formatCurrency(invoice.totalAmount)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Products & Services */}
      {Object.values(itemsByProduct).map((productGroup, index) => (
        <Card
          key={productGroup.productId || index}
          title={`Sản phẩm: ${productGroup.productName || 'Không xác định'}`}
          style={{ marginBottom: '16px' }}
          extra={
            productGroup.items[0]?.qrCode && (
              <QRCodeSVG value={productGroup.items[0].qrCode} size={80} />
            )
          }
        >
          {/* Product Images */}
          {productGroup.images.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Ảnh sản phẩm:</Text>
              <Image.PreviewGroup>
                <Row gutter={[8, 8]} style={{ marginTop: '8px' }}>
                  {productGroup.images.map((img, imgIndex) => (
                    <Col key={imgIndex}>
                      <Image
                        src={img}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
          )}

          {/* Notes */}
          {productGroup.notes && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fffbe6', borderRadius: '4px' }}>
              <Text strong>Ghi chú: </Text>
              <Text>{productGroup.notes}</Text>
            </div>
          )}

          {/* Services Table */}
          <Table
            columns={itemColumns}
            dataSource={productGroup.items}
            rowKey="id"
            pagination={false}
            summary={(pageData) => {
              const total = pageData.reduce((sum, record) => {
                return sum + parseFloat(record.price) * record.quantity;
              }, 0);
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Tổng cho sản phẩm này:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ fontSize: '16px' }}>
                        {formatCurrency(total)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />

          {/* QR Code for each service */}
          {productGroup.items.length > 0 && productGroup.items[0].qrCode && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                QR Code: {productGroup.items[0].qrCode}
              </Text>
            </div>
          )}
        </Card>
      ))}

      {/* Total Summary */}
      <Card style={{ background: '#f0f2f5' }}>
        <Row justify="end">
          <Col>
            <Title level={3}>
              Tổng cộng: <span style={{ color: '#1890ff' }}>{formatCurrency(invoice.totalAmount)}</span>
            </Title>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default InvoiceDetail;

