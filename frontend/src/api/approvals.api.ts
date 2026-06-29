import api from './axios';
export const getApprovals = (params?: any) => api.get('/approvals', { params });
export const getApproval = (id: string) => api.get(`/approvals/${id}`);
export const approveExpense = (id: string) => api.post(`/approvals/${id}/approve`);
export const rejectExpense = (id: string, reason: string) => api.post(`/approvals/${id}/reject`, { reason });
export const getApprovalHistory = (id: string) => api.get(`/approvals/${id}/history`);
