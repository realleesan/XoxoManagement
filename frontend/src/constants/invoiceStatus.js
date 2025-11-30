// Invoice Status Constants
export const INVOICE_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.PENDING]: 'Chờ thanh toán',
  [INVOICE_STATUS.PAID]: 'Đã thanh toán',
  [INVOICE_STATUS.CANCELLED]: 'Đã hủy',
};

export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUS.PENDING]: 'warning',
  [INVOICE_STATUS.PAID]: 'success',
  [INVOICE_STATUS.CANCELLED]: 'error',
};

