import { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import useAuthStore from '../store/authStore.js';

function Register() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('📤 Register request:', values);
      const response = await authService.register(values);
      console.log('✅ Register response:', response);
      setToken(response.token);
      setUser(response.user);
      message.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      console.error('❌ Register error:', error);
      console.error('   Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.message || 'Đăng ký thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ maxWidth: '92vw', width: 400, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Đăng ký</h2>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            initialValue="USER"
          >
            <Select>
              <Select.Option value="USER">Nhân viên</Select.Option>
              <Select.Option value="SALES">Sale</Select.Option>
              <Select.Option value="TECHNICIAN">Kỹ thuật</Select.Option>
              <Select.Option value="MANAGER">Quản lý</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button type="link" onClick={() => navigate('/login')}>
            Đã có tài khoản? Đăng nhập
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Register;

