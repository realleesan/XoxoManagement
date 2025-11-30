// Workflow Status Constants
export const WORKFLOW_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
};

export const WORKFLOW_STATUS_LABELS = {
  [WORKFLOW_STATUS.PENDING]: 'Chờ xử lý',
  [WORKFLOW_STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [WORKFLOW_STATUS.COMPLETED]: 'Hoàn thành',
  [WORKFLOW_STATUS.BLOCKED]: 'Bị chặn',
};

export const WORKFLOW_STATUS_COLORS = {
  [WORKFLOW_STATUS.PENDING]: 'default',
  [WORKFLOW_STATUS.IN_PROGRESS]: 'processing',
  [WORKFLOW_STATUS.COMPLETED]: 'success',
  [WORKFLOW_STATUS.BLOCKED]: 'error',
};

// Stage Status Constants
export const STAGE_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
};

export const STAGE_STATUS_LABELS = {
  [STAGE_STATUS.PENDING]: 'Chờ xử lý',
  [STAGE_STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [STAGE_STATUS.COMPLETED]: 'Hoàn thành',
  [STAGE_STATUS.BLOCKED]: 'Bị chặn',
};

export const STAGE_STATUS_COLORS = {
  [STAGE_STATUS.PENDING]: 'default',
  [STAGE_STATUS.IN_PROGRESS]: 'processing',
  [STAGE_STATUS.COMPLETED]: 'success',
  [STAGE_STATUS.BLOCKED]: 'error',
};

// Default Stage Names
export const DEFAULT_STAGES = [
  { name: 'Vệ sinh', order: 1 },
  { name: 'Khâu vá', order: 2 },
  { name: 'Phục hồi màu', order: 3 },
  { name: 'Xi mạ', order: 4 },
];

