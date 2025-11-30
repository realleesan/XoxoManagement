// Product Status Constants
export const PRODUCT_STATUS = {
  DANG_LAM: 'DANG_LAM',
  DA_XONG: 'DA_XONG',
  CO_VAN_DE: 'CO_VAN_DE',
  KHIEU_NAI: 'KHIEU_NAI',
};

export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.DANG_LAM]: 'Đang làm',
  [PRODUCT_STATUS.DA_XONG]: 'Đã xong',
  [PRODUCT_STATUS.CO_VAN_DE]: 'Có vấn đề',
  [PRODUCT_STATUS.KHIEU_NAI]: 'Khiếu nại',
};

export const PRODUCT_STATUS_COLORS = {
  [PRODUCT_STATUS.DANG_LAM]: 'processing',
  [PRODUCT_STATUS.DA_XONG]: 'success',
  [PRODUCT_STATUS.CO_VAN_DE]: 'warning',
  [PRODUCT_STATUS.KHIEU_NAI]: 'error',
};

