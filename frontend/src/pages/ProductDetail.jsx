import { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Image,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { productsService } from '../services/products.service.js';
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_COLORS,
} from '../constants/productStatus.js';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await productsService.getProductById(id);
      setProduct(response.product);
    } catch (error) {
      message.error('Lỗi khi tải thông tin sản phẩm: ' + (error.response?.data?.error || error.message));
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return <div>Đang tải...</div>;
  }

  // Parse images if string
  const images = typeof product.images === 'string' 
    ? (() => {
        try {
          return JSON.parse(product.images);
        } catch {
          return [];
        }
      })()
    : (product.images || []);

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '16px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
          Quay lại
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/products?edit=${id}`)}>
          Chỉnh sửa
        </Button>
        {product.customer && (
          <Button 
            icon={<UserOutlined />} 
            onClick={() => navigate(`/customers/${product.customer.id}`)}
          >
            Xem Khách hàng
          </Button>
        )}
      </Space>

      <Card title="Thông tin Sản phẩm" style={{ marginBottom: '24px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Tên sản phẩm">{product.name}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={PRODUCT_STATUS_COLORS[product.status]}>
              {PRODUCT_STATUS_LABELS[product.status] || product.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng" span={2}>
            {product.customer ? (
              <Space>
                <UserOutlined />
                {product.customer.name} - {product.customer.phone}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          {product.description && (
            <Descriptions.Item label="Mô tả" span={2}>
              {product.description}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ngày tạo" span={2}>
            {new Date(product.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {images.length > 0 && (
        <Card title="Ảnh sản phẩm" style={{ marginBottom: '24px' }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {images.map((url, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <Image
                    src={url}
                    alt={`Product image ${index + 1}`}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </Card>
      )}

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Quy trình"
              value={product.workflowsCount || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProductDetail;

