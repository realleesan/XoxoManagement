/**
 * Format currency (VND)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₫0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

