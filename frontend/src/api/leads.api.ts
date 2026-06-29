import api from './axios';
export const getLeads = (params?: any) => api.get('/leads', { params });
export const getLead = (id: string) => api.get(`/leads/${id}`);
export const createLead = (data: any) => api.post('/leads', data);
export const updateLead = (id: string, data: any) => api.patch(`/leads/${id}`, data);
export const deleteLead = (id: string) => api.delete(`/leads/${id}`);
export const assignLead = (id: string, data: any) => api.post(`/leads/${id}/assign`, data);
export const addLeadRemark = (id: string, data: any) => api.post(`/leads/${id}/remarks`, data);
export const changeLeadStatus = (id: string, status: string) => api.patch(`/leads/${id}/status`, { status });
