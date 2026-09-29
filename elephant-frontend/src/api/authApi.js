import api from './axiosConfig';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },
  updatePreferences: async (preferences) => {
    const res = await api.put('/auth/preferences', preferences);
    return res.data;
  },
  changePassword: async (passwordData) => {
    const res = await api.post('/auth/change-password', passwordData);
    return res.data;
  },
};
