import { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Timeline,
  Form,
  Input,
  Select,
  message,
  Space,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { leadsService } from '../services/leads.service.js';
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS,
  ACTIVITY_TYPE,
  ACTIVITY_TYPE_LABELS,
} from '../constants/leadStatus.js';

const { TextArea } = Input;
const { Option } = Select;

function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityForm] = Form.useForm();

  useEffect(() => {
    fetchLeadDetail();
  }, [id]);

  const fetchLeadDetail = async () => {
    setLoading(true);
    try {
      const response = await leadsService.getLeadById(id);
      setLead(response.lead);
      setActivities(response.lead.activities || []);
    } catch (error) {
      message.error('Lỗi khi tải thông tin lead: ' + (error.response?.data?.error || error.message));
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (values) => {
    try {
      await leadsService.addActivity(id, values);
      message.success('Thêm hoạt động thành công!');
      activityForm.resetFields();
      fetchLeadDetail();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading || !lead) {
    return <div>Đang tải...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '16px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/leads')}>
          Quay lại
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/leads?edit=${id}`)}>
          Chỉnh sửa
        </Button>
      </Space>

      <Card title="Thông tin Lead" style={{ marginBottom: '24px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Tên">{lead.name}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <Space>
              <PhoneOutlined />
              {lead.phone}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {lead.email ? (
              <Space>
                <MailOutlined />
                {lead.email}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Nguồn">
            <Tag color="blue">{LEAD_SOURCE_LABELS[lead.source] || lead.source}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={LEAD_STATUS_COLORS[lead.status]}>
              {LEAD_STATUS_LABELS[lead.status] || lead.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Người phụ trách">
            {lead.assignedUser?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={2}>
            {new Date(lead.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          {lead.notes && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {lead.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Hoạt động">
        <Form
          form={activityForm}
          layout="vertical"
          onFinish={handleAddActivity}
          style={{ marginBottom: '24px' }}
        >
          <Form.Item
            name="type"
            label="Loại hoạt động"
            rules={[{ required: true, message: 'Vui lòng chọn loại hoạt động!' }]}
          >
            <Select placeholder="Chọn loại hoạt động">
              {Object.values(ACTIVITY_TYPE).map((type) => (
                <Option key={type} value={type}>
                  {ACTIVITY_TYPE_LABELS[type]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea rows={4} placeholder="Nhập nội dung hoạt động..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Thêm hoạt động
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Timeline>
          {activities.length === 0 ? (
            <Timeline.Item>Chưa có hoạt động nào</Timeline.Item>
          ) : (
            activities.map((activity) => (
              <Timeline.Item key={activity.id} color="blue">
                <div>
                  <Tag>{ACTIVITY_TYPE_LABELS[activity.type]}</Tag>
                  <div style={{ marginTop: '8px' }}>{activity.content}</div>
                  <div style={{ marginTop: '8px', color: '#999', fontSize: '12px' }}>
                    {new Date(activity.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </Timeline.Item>
            ))
          )}
        </Timeline>
      </Card>
    </div>
  );
}

export default LeadDetail;

