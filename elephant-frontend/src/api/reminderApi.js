import api from './axiosConfig';

export const reminderApi = {
    getReminders: async () => {
        const res = await api.get('/reminders');
        return res.data;
    },
    getReminder: async (id) => {
        const res = await api.get(`/reminders/${id}`);
        return res.data;
    },
    createReminder: async (reminderData) => {
        const res = await api.post('/reminders', reminderData);
        return res.data;
    },
    updateReminder: async (id, reminderData) => {
        const res = await api.put(`/reminders/${id}`, reminderData);
        return res.data;
    },
    deleteReminder: async (id) => {
        const res = await api.delete(`/reminders/${id}`);
        return res.data;
    },
    activate: async (id) => {
        const res = await api.post(`/reminders/${id}/activate`);
        return res.data;
    },
    deactivate: async (id) => {
        const res = await api.post(`/reminders/${id}/deactivate`);
        return res.data;
    },
    getContext: async () => {
        const res = await api.get('/reminders/context');
        return res.data;
    },
};
