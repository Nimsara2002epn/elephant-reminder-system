import api from './axiosConfig';

export const eventApi = {
  getEvents: async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data;
  },
  getEvent: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  createEvent: async (eventData) => {
    const res = await api.post('/events', eventData);
    return res.data;
  },
  updateEvent: async (id, eventData) => {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data;
  },
  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.post(`/events/${id}/status`, { status });
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/events/stats');
    return res.data;
  },
  getCalendarItems: async () => {
    const res = await api.get('/events/calendar');
    return res.data;
  },
};
