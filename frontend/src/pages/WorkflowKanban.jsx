import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  Input,
  Select,
  Space,
  message,
  Modal,
  Form,
  DatePicker,
  Checkbox,
  Popconfirm,
  Badge,
  Typography,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { workflowsService } from '../services/workflows.service.js';
import {
  STAGE_STATUS,
  STAGE_STATUS_LABELS,
  STAGE_STATUS_COLORS,
} from '../constants/workflowStatus.js';
import { format } from 'date-fns';

const { Option } = Select;
const { Text } = Typography;

function WorkflowKanban() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [taskForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  // Fetch workflow
  const fetchWorkflow = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching workflow with ID:', id);
      const response = await workflowsService.getWorkflowById(id);
      console.log('✅ Workflow fetched:', response.workflow);
      setWorkflow(response.workflow);
    } catch (error) {
      console.error('❌ Error fetching workflow:', error);
      const errorMessage = error.response?.data?.error || error.message;
      message.error('Lỗi khi tải quy trình: ' + errorMessage);
      
      // Nếu là lỗi "Workflow not found", có thể là chưa chạy migration
      if (errorMessage.includes('table does not exist')) {
        message.warning('Vui lòng chạy SQL migration để tạo bảng workflows!');
      } else if (errorMessage.includes('not found')) {
        message.warning('Quy trình không tồn tại. Vui lòng tạo quy trình mới từ trang danh sách.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await workflowsService.getUsersList();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchWorkflow();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Update stage status
  const handleStageStatusChange = async (stageId, status) => {
    try {
      await workflowsService.updateStageStatus(stageId, status);
      message.success('Cập nhật trạng thái thành công!');
      fetchWorkflow();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Assign stage
  const handleAssign = async (values) => {
    try {
      await workflowsService.assignStage(selectedStage.id, values.userId);
      message.success('Phân công thành công!');
      setAssignModalVisible(false);
      assignForm.resetFields();
      fetchWorkflow();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Add task
  const handleAddTask = async (values) => {
    try {
      await workflowsService.addTaskToStage(selectedStage.id, values.name);
      message.success('Thêm nhiệm vụ thành công!');
      setTaskModalVisible(false);
      taskForm.resetFields();
      fetchWorkflow();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Update task completion
  const handleTaskToggle = async (taskId, completed) => {
    try {
      await workflowsService.updateTaskCompletion(taskId, !completed);
      fetchWorkflow();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await workflowsService.deleteTask(taskId);
      message.success('Xóa nhiệm vụ thành công!');
      fetchWorkflow();
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  // Open assign modal
  const openAssignModal = (stage) => {
    setSelectedStage(stage);
    assignForm.setFieldsValue({
      userId: stage.assignedTo || undefined,
    });
    setAssignModalVisible(true);
  };

  // Open task modal
  const openTaskModal = (stage) => {
    setSelectedStage(stage);
    taskForm.resetFields();
    setTaskModalVisible(true);
  };

  if (loading && !workflow) {
    return <div style={{ padding: '24px' }}>Đang tải...</div>;
  }

  if (!workflow) {
    return <div style={{ padding: '24px' }}>Không tìm thấy quy trình</div>;
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/workflows')}>
              Quay lại
            </Button>
            <div>
              <h2 style={{ margin: 0 }}>{workflow.name}</h2>
              <Text type="secondary">
                Sản phẩm: {workflow.productName} | KH: {workflow.customerName}
              </Text>
            </div>
          </Space>
          <Tag color={STAGE_STATUS_COLORS[workflow.status]}>
            {STAGE_STATUS_LABELS[workflow.status]}
          </Tag>
        </Space>
      </Card>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
        {workflow.stages?.map((stage) => (
          <Card
            key={stage.id}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{stage.name}</span>
                <Badge count={stage.tasks?.filter(t => !t.completed).length || 0} />
              </div>
            }
            style={{
              minWidth: '300px',
              flex: '0 0 auto',
              background: stage.status === 'COMPLETED' ? '#f6ffed' : '#fff',
            }}
            extra={
              <Select
                size="small"
                value={stage.status}
                onChange={(value) => handleStageStatusChange(stage.id, value)}
                style={{ width: 120 }}
              >
                {Object.values(STAGE_STATUS).map((status) => (
                  <Option key={status} value={status}>
                    {STAGE_STATUS_LABELS[status]}
                  </Option>
                ))}
              </Select>
            }
          >
            {/* Stage Info */}
            <div style={{ marginBottom: '16px' }}>
              {stage.assignedToName && (
                <div style={{ marginBottom: '8px' }}>
                  <UserOutlined /> {stage.assignedToName}
                </div>
              )}
              {stage.dueDate && (
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                  <CalendarOutlined /> {format(new Date(stage.dueDate), 'dd/MM/yyyy')}
                </div>
              )}
              <Space>
                <Button
                  size="small"
                  onClick={() => openAssignModal(stage)}
                >
                  Phân công
                </Button>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => openTaskModal(stage)}
                >
                  Thêm NV
                </Button>
              </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Tasks */}
            <div style={{ minHeight: '200px' }}>
              {stage.tasks?.map((task) => (
                <Card
                  key={task.id}
                  size="small"
                  style={{
                    marginBottom: '8px',
                    background: task.completed ? '#f0f0f0' : '#fff',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                  actions={[
                    <Checkbox
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task.id, task.completed)}
                    />,
                    <Popconfirm
                      title="Xóa nhiệm vụ này?"
                      onConfirm={() => handleDeleteTask(task.id)}
                    >
                      <Button type="text" danger size="small" icon={<CloseOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <Text delete={task.completed}>{task.name}</Text>
                </Card>
              ))}
              {(!stage.tasks || stage.tasks.length === 0) && (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  Chưa có nhiệm vụ
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Assign Modal */}
      <Modal
        title="Phân công giai đoạn"
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          assignForm.resetFields();
        }}
        onOk={() => assignForm.submit()}
      >
        <Form form={assignForm} onFinish={handleAssign} layout="vertical">
          <Form.Item name="userId" label="Người phụ trách">
            <Select placeholder="Chọn người phụ trách" allowClear>
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Modal */}
      <Modal
        title="Thêm nhiệm vụ"
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          taskForm.resetFields();
        }}
        onOk={() => taskForm.submit()}
      >
        <Form form={taskForm} onFinish={handleAddTask} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nhiệm vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
          >
            <Input placeholder="Nhập tên nhiệm vụ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default WorkflowKanban;

