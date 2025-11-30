// Lead Status Constants
export const LEAD_STATUS = {
  CAN_NHAC: 'CAN_NHAC',
  HEN_GUI_ANH: 'HEN_GUI_ANH',
  HEN_QUA_SHOP: 'HEN_QUA_SHOP',
  HEN_GUI_SAN_PHAM: 'HEN_GUI_SAN_PHAM',
  KHACH_TOI_SHOP: 'KHACH_TOI_SHOP',
  DA_BAO_GIA_IM_LANG: 'DA_BAO_GIA_IM_LANG',
};

export const LEAD_STATUS_LABELS = {
  [LEAD_STATUS.CAN_NHAC]: 'Cần nhắc',
  [LEAD_STATUS.HEN_GUI_ANH]: 'Hẹn gửi ảnh',
  [LEAD_STATUS.HEN_QUA_SHOP]: 'Hẹn qua shop',
  [LEAD_STATUS.HEN_GUI_SAN_PHAM]: 'Hẹn gửi sản phẩm',
  [LEAD_STATUS.KHACH_TOI_SHOP]: 'Khách tới shop',
  [LEAD_STATUS.DA_BAO_GIA_IM_LANG]: 'Đã báo giá im lặng',
};

export const LEAD_STATUS_COLORS = {
  [LEAD_STATUS.CAN_NHAC]: 'default',
  [LEAD_STATUS.HEN_GUI_ANH]: 'processing',
  [LEAD_STATUS.HEN_QUA_SHOP]: 'warning',
  [LEAD_STATUS.HEN_GUI_SAN_PHAM]: 'processing',
  [LEAD_STATUS.KHACH_TOI_SHOP]: 'success',
  [LEAD_STATUS.DA_BAO_GIA_IM_LANG]: 'error',
};

// Lead Source Constants
export const LEAD_SOURCE = {
  FACEBOOK: 'FACEBOOK',
  ZALO: 'ZALO',
  TIKTOK: 'TIKTOK',
  WEBSITE: 'WEBSITE',
  OTHER: 'OTHER',
};

export const LEAD_SOURCE_LABELS = {
  [LEAD_SOURCE.FACEBOOK]: 'Facebook',
  [LEAD_SOURCE.ZALO]: 'Zalo',
  [LEAD_SOURCE.TIKTOK]: 'TikTok',
  [LEAD_SOURCE.WEBSITE]: 'Website',
  [LEAD_SOURCE.OTHER]: 'Khác',
};

// Activity Type Constants
export const ACTIVITY_TYPE = {
  CALL: 'CALL',
  EMAIL: 'EMAIL',
  MESSAGE: 'MESSAGE',
  NOTE: 'NOTE',
  MEETING: 'MEETING',
};

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPE.CALL]: 'Cuộc gọi',
  [ACTIVITY_TYPE.EMAIL]: 'Email',
  [ACTIVITY_TYPE.MESSAGE]: 'Tin nhắn',
  [ACTIVITY_TYPE.NOTE]: 'Ghi chú',
  [ACTIVITY_TYPE.MEETING]: 'Cuộc họp',
};

export const ACTIVITY_TYPE_ICONS = {
  [ACTIVITY_TYPE.CALL]: 'phone',
  [ACTIVITY_TYPE.EMAIL]: 'mail',
  [ACTIVITY_TYPE.MESSAGE]: 'message',
  [ACTIVITY_TYPE.NOTE]: 'file-text',
  [ACTIVITY_TYPE.MEETING]: 'calendar',
};

