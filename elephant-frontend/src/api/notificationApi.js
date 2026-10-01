import api from './axiosConfig';

export const notificationApi = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  getUnread: async () => {
    const res = await api.get('/notifications/unread');
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get('/notifications/count');
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
  clearRead: async () => {
    const res = await api.delete('/notifications/clear-read');
    return res.data;
  },
};
