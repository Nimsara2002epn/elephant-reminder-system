import api from './axiosConfig';

export const billApi = {
  getBills: async (params = {}) => {
    const res = await api.get('/bills', { params });
    return res.data;
  },
  getBill: async (id) => {
    const res = await api.get(`/bills/${id}`);
    return res.data;
  },
  createBill: async (billData) => {
    const res = await api.post('/bills', billData);
    return res.data;
  },
  updateBill: async (id, billData) => {
    const res = await api.put(`/bills/${id}`, billData);
    return res.data;
  },
  deleteBill: async (id) => {
    const res = await api.delete(`/bills/${id}`);
    return res.data;
  },
  markAsPaid: async (id) => {
    const res = await api.post(`/bills/${id}/pay`);
    return res.data;
  },
  markAsUnpaid: async (id) => {
    const res = await api.post(`/bills/${id}/unpay`);
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/bills/categories');
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/bills/stats');
    return res.data;
  },
};
