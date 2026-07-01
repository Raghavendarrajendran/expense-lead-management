import api from './axios';

export const getMasters = () => api.get('/masters');
export const updateMaster = (key: string, values: string[]) => api.put(`/masters/${key}`, { values });
