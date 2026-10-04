import api from './axiosConfig';

export const adminApi = {
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  toggleUserStatus: async (id) => {
    const res = await api.post(`/admin/users/${id}/toggle`);
    return res.data;
  },
  updateUserRole: async (id, role) => {
    const res = await api.post(`/admin/users/${id}/role`, { role });
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
  getSystemStatus: async () => {
    const res = await api.get('/admin/system-status');
    return res.data;
  },
  getLogs: async (limit = 100) => {
    const res = await api.get('/admin/logs', { params: { limit } });
    return res.data;
  },
  cleanLogs: async (days = 30) => {
    const res = await api.post('/admin/logs/clean', { days });
    return res.data;
  },
  getBackups: async () => {
    const res = await api.get('/admin/backups');
    return res.data;
  },
  createBackup: async (name) => {
    const res = await api.post('/admin/backups', { name });
    return res.data;
  },
  recoverBackup: async (id) => {
    const res = await api.post(`/admin/backups/${id}/recover`);
    return res.data;
  },
  deleteBackup: async (id) => {
    const res = await api.delete(`/admin/backups/${id}`);
    return res.data;
  },
};
