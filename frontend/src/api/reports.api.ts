import api from './axios';
export const getLeadReports = (params?: any) => api.get('/reports/leads', { params });
export const getExpenseReports = (params?: any) => api.get('/reports/expenses', { params });
