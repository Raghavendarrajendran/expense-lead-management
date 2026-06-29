import api from './axios';
export const getFinanceQueue = () => api.get('/finance');
export const verifyExpense = (id: string) => api.post(`/finance/${id}/verify`);
export const rejectFinance = (id: string, reason: string) => api.post(`/finance/${id}/reject`, { reason });
export const markAsPaid = (id: string) => api.post(`/finance/${id}/mark-paid`);
