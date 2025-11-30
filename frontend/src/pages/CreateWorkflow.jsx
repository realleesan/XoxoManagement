import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Row,
  Col,
  DatePicker,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { workflowsService } from '../services/workflows.service.js';
import { productsService } from '../services/products.service.js';
import { DEFAULT_STAGES } from '../constants/workflowStatus.js';

const { Option } = Select;
const { TextArea } = Input;

function CreateWorkflow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState(DEFAULT_STAGES.map((s, index) => ({
    ...s,
    id: index,
    assignedTo: undefined,
    dueDate: undefined,
    tasks: [],
  })));

  // Get productId from location state (if coming from Product Detail)
  const productIdFromState = location.state?.productId;

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    if (productIdFromState) {
      form.setFieldsValue({ productId: productIdFromState });
    }
  }, [productIdFromState, form]);

  const fetchUsers = async () => {
    try {
      const response = await workflowsService.getUsersList();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleAddTask = (stageIndex) => {
    const newStages = [...stages];
    newStages[stageIndex].tasks.push('');
    setStages(newStages);
  };

  const handleRemoveTask = (stageIndex, taskIndex) => {
    const newStages = [...stages];
    newStages[stageIndex].tasks.splice(taskIndex, 1);
    setStages(newStages);
  };

  const handleTaskChange = (stageIndex, taskIndex, value) => {
    const newStages = [...stages];
    newStages[stageIndex].tasks[taskIndex] = value;
    setStages(newStages);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const workflowData = {
        productId: values.productId,
        name: values.name,
        stages: stages.map((stage, index) => ({
          name: stage.name,
          order: stage.order,
          assignedTo: stage.assignedTo,
          dueDate: stage.dueDate ? stage.dueDate.toISOString() : undefined,
          tasks: stage.tasks.filter(t => t && t.trim() !== ''),
        })),
      };

      const response = await workflowsService.createWorkflow(workflowData);
      message.success('Tạo quy trình thành công!');
      const workflowId = response.data?.workflow?.id || response.workflow?.id;
      if (workflowId) {
        navigate(`/workflows/${workflowId}`);
      } else {
        navigate('/workflows');
      }
    } catch (error) {
      message.error('Lỗi khi tạo quy trình: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/workflows')}>
            Quay lại
          </Button>
          <h2 style={{ margin: '16px 0 0 0' }}>Tạo Quy trình Sửa chữa mới</h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: '',
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="productId"
                label="Sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
              >
                <Select
                  placeholder="Chọn sản phẩm"
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
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên quy trình"
                rules={[{ required: true, message: 'Vui lòng nhập tên quy trình!' }]}
              >
                <Input placeholder="Ví dụ: Quy trình sửa chữa túi xách LV" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Các Giai đoạn</Divider>

          {stages.map((stage, stageIndex) => (
            <Card
              key={stage.id}
              title={stage.name}
              style={{ marginBottom: '16px' }}
              extra={
                <Space>
                  <Select
                    placeholder="Phân công"
                    style={{ width: 200 }}
                    value={stage.assignedTo}
                    onChange={(value) => {
                      const newStages = [...stages];
                      newStages[stageIndex].assignedTo = value;
                      setStages(newStages);
                    }}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {users.map((user) => (
                      <Option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </Option>
                    ))}
                  </Select>
                  <DatePicker
                    placeholder="Hạn hoàn thành"
                    value={stage.dueDate}
                    onChange={(date) => {
                      const newStages = [...stages];
                      newStages[stageIndex].dueDate = date;
                      setStages(newStages);
                    }}
                  />
                </Space>
              }
            >
              <div>
                <div style={{ marginBottom: '12px', fontWeight: 500 }}>Nhiệm vụ:</div>
                {stage.tasks.map((task, taskIndex) => (
                  <Space key={taskIndex} style={{ marginBottom: '8px', width: '100%' }}>
                    <Input
                      placeholder="Nhập tên nhiệm vụ"
                      value={task}
                      onChange={(e) => handleTaskChange(stageIndex, taskIndex, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveTask(stageIndex, taskIndex)}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddTask(stageIndex)}
                  block
                  style={{ marginTop: '8px' }}
                >
                  Thêm nhiệm vụ
                </Button>
              </div>
            </Card>
          ))}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo Quy trình
              </Button>
              <Button onClick={() => navigate('/workflows')}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateWorkflow;

