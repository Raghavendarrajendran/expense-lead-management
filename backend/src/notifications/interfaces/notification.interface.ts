import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationPriority } from '../enums/notification-priority.enum';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel[];
  priority: NotificationPriority;
  senderId?: string;
  receiverIds: string[];
  module: string;
  referenceId?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  scheduledAt?: string;
  metadata?: Record<string, any>;
}
