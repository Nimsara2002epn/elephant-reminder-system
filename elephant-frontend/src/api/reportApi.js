import api from './axiosConfig';

export const reportApi = {
  getReports: async () => {
    const res = await api.get('/reports');
    return res.data;
  },
  getReport: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },
  createReport: async (reportData) => {
    const res = await api.post('/reports', reportData);
    return res.data;
  },
  deleteReport: async (id) => {
    const res = await api.delete(`/reports/${id}`);
    return res.data;
  },
  getDashboardData: async () => {
    const res = await api.get('/reports/dashboard');
    return res.data;
  },
  getChartsData: async () => {
    const res = await api.get('/reports/charts');
    return res.data;
  },
  exportCsv: async (reportType = 'FINANCIAL', startDate = '', endDate = '') => {
    const params = new URLSearchParams();
    if (reportType) params.append('type', reportType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await api.get(`/reports/export/csv?${params.toString()}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
