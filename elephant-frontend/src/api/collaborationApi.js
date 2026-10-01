import api from './axiosConfig';

export const collaborationApi = {
  getGroups: async () => {
    const res = await api.get('/collaboration');
    return res.data;
  },
  createGroup: async (groupData) => {
    const res = await api.post('/collaboration', groupData);
    return res.data;
  },
  getGroupDetail: async (id) => {
    const res = await api.get(`/collaboration/${id}`);
    return res.data;
  },
  deleteGroup: async (id) => {
    const res = await api.delete(`/collaboration/${id}`);
    return res.data;
  },
  addMember: async (groupId, memberData) => {
    const res = await api.post(`/collaboration/${groupId}/members`, memberData);
    return res.data;
  },
  updateResponsibility: async (groupId, memberId, responsibility) => {
    const res = await api.put(`/collaboration/${groupId}/members/${memberId}`, { responsibility });
    return res.data;
  },
  removeMember: async (groupId, userId) => {
    const res = await api.delete(`/collaboration/${groupId}/members/${userId}`);
    return res.data;
  },
  assignBill: async (groupId, assignData) => {
    const res = await api.post(`/collaboration/${groupId}/bills`, assignData);
    return res.data;
  },
  unassignBill: async (groupId, groupBillId) => {
    const res = await api.delete(`/collaboration/${groupId}/bills/${groupBillId}`);
    return res.data;
  },
  assignEvent: async (groupId, assignData) => {
    const res = await api.post(`/collaboration/${groupId}/events`, assignData);
    return res.data;
  },
  unassignEvent: async (groupId, groupEventId) => {
    const res = await api.delete(`/collaboration/${groupId}/events/${groupEventId}`);
    return res.data;
  },
  getContributions: async (groupId) => {
    const res = await api.get(`/collaboration/${groupId}/contributions`);
    return res.data;
  },
  getActivities: async (groupId) => {
    const res = await api.get(`/collaboration/${groupId}/activities`);
    return res.data;
  },
  searchUsers: async () => {
    const res = await api.get('/collaboration/users/search');
    return res.data;
  },
};
