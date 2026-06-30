import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { EmailService } from '../email/email.service';
import { Notification } from './interfaces/notification.interface';
import { NotificationChannel } from './enums/notification-channel.enum';
import { NotificationPriority } from './enums/notification-priority.enum';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly emailService: EmailService,
  ) {
    // Start follow-up check interval sweep on startup (checks every 5 minutes)
    setInterval(() => {
      this.checkFollowUpReminders();
    }, 5 * 60 * 1000);
  }

  findAll(query: any, user: any): Notification[] {
    let list = this.store.getNotifications();

    // Enforce scoping: users only see notifications targeted to them
    list = list.filter(n => n.receiverIds.includes(user.sub));

    // Filters
    if (query.unreadOnly === 'true') {
      list = list.filter(n => !n.isRead);
    }
    if (query.type) {
      list = list.filter(n => n.type === query.type);
    }
    if (query.priority) {
      list = list.filter(n => n.priority === query.priority);
    }
    if (query.module) {
      list = list.filter(n => n.module === query.module);
    }
    if (query.from) {
      list = list.filter(n => n.createdAt >= query.from);
    }
    if (query.to) {
      list = list.filter(n => n.createdAt <= query.to);
    }

    // Sort descending by date
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getUnreadCount(userId: string): number {
    return this.store.getNotifications().filter(n => n.receiverIds.includes(userId) && !n.isRead).length;
  }

  markAsRead(id: string, userId: string): Notification {
    const notif = this.store.getNotificationById(id);
    if (!notif) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    if (!notif.receiverIds.includes(userId)) {
      throw new NotFoundException(`Access denied for notification ${id}`);
    }

    return this.store.updateNotification(id, {
      isRead: true,
      readAt: new Date().toISOString(),
    })!;
  }

  markAllAsRead(userId: string): void {
    const unread = this.store.getNotifications().filter(
      n => n.receiverIds.includes(userId) && !n.isRead
    );
    for (const notif of unread) {
      this.store.updateNotification(notif.id, {
        isRead: true,
        readAt: new Date().toISOString(),
      });
    }
  }

  delete(id: string, userId: string): void {
    const notif = this.store.getNotificationById(id);
    if (!notif) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    if (!notif.receiverIds.includes(userId)) {
      throw new NotFoundException(`Access denied for notification ${id}`);
    }
    this.store.deleteNotification(id);
  }

  // ── CORE DISPATCH INTERFACE METHODS ─────────────────────────────────

  createInAppNotification(data: any): Notification {
    return this.store.createNotification(data);
  }

  sendEmailNotification(receiverId: string, data: any) {
    const user = this.store.getUserById(receiverId);
    if (!user) return;

    this.emailService.sendEmail(
      user.email,
      data.title,
      data.message,
      data.module,
      data.referenceId,
      data.actionUrl,
      user.name,
    );
  }

  // ── ANNOUNCEMENT / MANUAL DISPATCH ──────────────────────────────────

  async createAnnouncement(dto: any, sender: any): Promise<void> {
    const baseData = {
      title: dto.title,
      message: dto.message,
      type: dto.type || NotificationType.ADMIN_ANNOUNCEMENT,
      channel: dto.channel || [NotificationChannel.IN_APP],
      priority: dto.priority || NotificationPriority.MEDIUM,
      module: dto.module || 'Admin Announcements',
      senderId: sender.sub,
      referenceId: dto.referenceId,
      actionUrl: dto.actionUrl,
      metadata: dto.metadata,
    };

    // Target: all users
    if (dto.targetAll) {
      await this.notifyAll(baseData);
      return;
    }

    // Target: specific role
    if (dto.targetRole) {
      await this.notifyRole(dto.targetRole, baseData);
      return;
    }

    // Target: sender's team
    if (dto.targetTeam) {
      await this.notifyTeam(sender.sub, baseData);
      return;
    }

    // Target: specific user IDs
    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.notifyUsers(dto.receiverIds, baseData);
      return;
    }
  }

  async notifyUser(data: any): Promise<Notification | null> {
    const channels: NotificationChannel[] = data.channel || [NotificationChannel.IN_APP];
    let inAppNotif: Notification | null = null;

    if (channels.includes(NotificationChannel.IN_APP)) {
      inAppNotif = this.createInAppNotification(data);
    }

    if (channels.includes(NotificationChannel.EMAIL)) {
      // Loop over receiverIds and email each
      for (const recId of data.receiverIds) {
        this.sendEmailNotification(recId, data);
      }
    }

    return inAppNotif;
  }

  async notifyUsers(receiverIds: string[], data: any): Promise<void> {
    for (const rId of receiverIds) {
      await this.notifyUser({
        ...data,
        receiverIds: [rId],
      });
    }
  }

  async notifyRole(roleName: string, data: any): Promise<void> {
    const users = this.store.getUsers().filter(u => {
      const roleObj = this.store.getRoleById(u.roleId);
      return roleObj?.name === roleName;
    });

    const ids = users.map(u => u.id);
    await this.notifyUsers(ids, data);
  }

  async notifyTeam(supervisorId: string, data: any): Promise<void> {
    const employees = this.store.getUsers().filter(
      u => u.managerId === supervisorId || u.teamLeadId === supervisorId
    );

    const ids = employees.map(u => u.id);
    await this.notifyUsers(ids, data);
  }

  async notifyAll(data: any): Promise<void> {
    const ids = this.store.getUsers().filter(u => u.isActive).map(u => u.id);
    await this.notifyUsers(ids, data);
  }

  // ── FOLLOW-UP BACKGROUND SCHEDULER ──
  private checkedLeadFollowUps: Record<string, string[]> = {}; // leadId -> array of reminder keys triggered e.g. ['1day', '1hour', 'overdue']

  public async checkFollowUpReminders(): Promise<void> {
    const leads = this.store.getLeads().filter(l => l.followUpDate);
    const now = new Date();

    for (const lead of leads) {
      if (!lead.followUpDate) continue;

      // The mock lead date might just be '2024-07-10', let's assume time is 11:00 AM as default if no time is present
      // We will parse the followUpDate (e.g. '2026-06-30') and combine it.
      const followUpDateTime = new Date(`${lead.followUpDate}T11:00:00`);
      if (isNaN(followUpDateTime.getTime())) continue;

      const diffMs = followUpDateTime.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      const triggered = this.checkedLeadFollowUps[lead.id] || [];

      // 1. One Day Reminder (between 20 to 28 hours ahead)
      if (diffHrs > 0 && diffHrs <= 24 && diffHrs >= 20 && !triggered.includes('1day')) {
        triggered.push('1day');
        this.checkedLeadFollowUps[lead.id] = triggered;

        await this.dispatchFollowUpNotification(
          lead,
          'Follow-up Reminder',
          `You have a follow-up with ${lead.customerName} tomorrow at 11:00 AM.`,
          NotificationType.FOLLOW_UP_REMINDER,
          NotificationPriority.HIGH,
        );
      }

      // 2. One Hour Reminder (between 0 to 1.5 hours ahead)
      if (diffHrs > 0 && diffHrs <= 1.1 && !triggered.includes('1hour')) {
        triggered.push('1hour');
        this.checkedLeadFollowUps[lead.id] = triggered;

        await this.dispatchFollowUpNotification(
          lead,
          'Upcoming Follow-up',
          `You have a follow-up with ${lead.customerName} in 1 hour.`,
          NotificationType.FOLLOW_UP_REMINDER,
          NotificationPriority.HIGH,
        );
      }

      // 3. Overdue Reminder (time elapsed by more than 5 mins, status not Converted/Lost/Completed)
      const isOverdue = diffMs < -5 * 60 * 1000 && lead.status !== 'Converted' && lead.status !== 'Lost';
      if (isOverdue && !triggered.includes('overdue')) {
        triggered.push('overdue');
        this.checkedLeadFollowUps[lead.id] = triggered;

        await this.dispatchFollowUpNotification(
          lead,
          'Follow-up Overdue',
          `Follow-up with ${lead.customerName} is overdue. Please update the status.`,
          NotificationType.FOLLOW_UP_OVERDUE,
          NotificationPriority.URGENT,
        );
      }
    }
  }

  private async dispatchFollowUpNotification(
    lead: any,
    title: string,
    message: string,
    type: NotificationType,
    priority: NotificationPriority,
  ) {
    // Recipients: Assigned Exec, Team Lead, Manager
    const recipients: string[] = [];
    if (lead.assignedExecutiveId) {
      recipients.push(lead.assignedExecutiveId);

      // Fetch reporting hierarchy leads
      const execUser = this.store.getUserById(lead.assignedExecutiveId);
      if (execUser) {
        if (execUser.teamLeadId) recipients.push(execUser.teamLeadId);
        if (execUser.managerId) recipients.push(execUser.managerId);
      }
    }

    // Deduplicate
    const uniqueRecipients = Array.from(new Set(recipients));

    if (uniqueRecipients.length > 0) {
      await this.notifyUsers(uniqueRecipients, {
        title,
        message,
        type,
        priority,
        module: 'Lead Management',
        referenceId: lead.id,
        actionUrl: `/leads/${lead.id}`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      });
    }
  }
}
