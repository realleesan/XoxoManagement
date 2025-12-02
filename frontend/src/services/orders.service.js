import api from './api.js';

export const ordersService = {
    getAllOrders: (params) => api.get('/orders', { params }),
    getOrderById: (id) => api.get(`/orders/${id}`),
    createOrder: (data) => api.post('/orders', data),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    deleteOrder: (id) => api.delete(`/orders/${id}`),
};
