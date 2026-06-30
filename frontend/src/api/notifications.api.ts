import api from './axios';

export const getNotifications = (params?: Record<string, any>) =>
  api.get('/notifications', { params });

export const getUnreadCount = () =>
  api.get('/notifications/unread-count');

export const markNotificationRead = (id: string) =>
  api.patch(`/notifications/${id}/read`);

export const markAllRead = () =>
  api.patch('/notifications/mark-all-read');

export const createNotification = (data: any) =>
  api.post('/notifications', data);

export const deleteNotification = (id: string) =>
  api.delete(`/notifications/${id}`);
