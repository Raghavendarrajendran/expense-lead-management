import api from './axios';
export const getSiteVisits = (params?: any) => api.get('/site-visits', { params });
export const getSiteVisit = (id: string) => api.get(`/site-visits/${id}`);
export const createSiteVisit = (data: any) => api.post('/site-visits', data);
export const updateSiteVisit = (id: string, data: any) => api.patch(`/site-visits/${id}`, data);
