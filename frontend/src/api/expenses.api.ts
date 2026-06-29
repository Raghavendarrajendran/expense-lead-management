import api from './axios';
export const getExpenses = (params?: any) => api.get('/expenses', { params });
export const getExpense = (id: string) => api.get(`/expenses/${id}`);
export const createExpense = (data: any) => api.post('/expenses', data);
export const updateExpense = (id: string, data: any) => api.patch(`/expenses/${id}`, data);
export const submitExpense = (id: string) => api.post(`/expenses/${id}/submit`);
export const getLimitsProgress = () => api.get('/expenses/limits-progress');
