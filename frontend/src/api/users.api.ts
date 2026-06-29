import api from './axios';
export const getUsers = (params?: any) => api.get('/users', { params });
export const getUser = (id: string) => api.get(`/users/${id}`);
export const createUser = (data: any) => api.post('/users', data);
export const updateUser = (id: string, data: any) => api.patch(`/users/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);
export const assignRole = (id: string, roleId: string) => api.post(`/users/${id}/assign-role`, { roleId });
export const mapHierarchy = (data: any) => api.post('/users/map-hierarchy', data);
