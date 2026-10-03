import api from './axiosConfig';

export const feedbackApi = {
  getMyFeedback: async () => {
    const res = await api.get('/feedback/my');
    return res.data;
  },
  getAllFeedback: async () => {
    const res = await api.get('/feedback/all');
    return res.data;
  },
  getFeedbackStats: async () => {
    const res = await api.get('/feedback/stats');
    return res.data;
  },
  submitFeedback: async (feedbackData) => {
    const res = await api.post('/feedback', feedbackData);
    return res.data;
  },
  updateFeedback: async (id, feedbackData) => {
    const res = await api.put(`/feedback/${id}`, feedbackData);
    return res.data;
  },
  adminUpdateFeedback: async (id, adminData) => {
    const res = await api.put(`/feedback/${id}/admin`, adminData);
    return res.data;
  },
  deleteFeedback: async (id) => {
    const res = await api.delete(`/feedback/${id}`);
    return res.data;
  },
};
