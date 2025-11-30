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
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { customersService } from '../services/customers.service.js';

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomerDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const response = await customersService.getCustomerById(id);
      setCustomer(response.customer);
    } catch (error) {
      message.error('Lỗi khi tải thông tin khách hàng: ' + (error.response?.data?.error || error.message));
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !customer) {
    return <div>Đang tải...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '16px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>
          Quay lại
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/customers?edit=${id}`)}>
          Chỉnh sửa
        </Button>
      </Space>

      <Card title="Thông tin Khách hàng" style={{ marginBottom: '24px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Tên">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <Space>
              <PhoneOutlined />
              {customer.phone}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {customer.email ? (
              <Space>
                <MailOutlined />
                {customer.email}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            {customer.address ? (
              <Space>
                <HomeOutlined />
                {customer.address}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          {customer.lead && (
            <Descriptions.Item label="Từ Lead">
              <Tag color="blue">{customer.lead.name}</Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ngày tạo" span={2}>
            {new Date(customer.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={customer.productsCount || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Hóa đơn"
              value={customer.invoicesCount || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CustomerDetail;

