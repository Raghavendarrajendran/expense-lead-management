import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LeadsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any, user: any) {
    let leads = this.store.getLeads();

    // Scope: field executives see only assigned leads
    if (user.roleName === 'field_executive') {
      leads = leads.filter(l => l.assignedExecutiveId === user.sub);
    }

    if (query.status) leads = leads.filter(l => l.status === query.status);
    if (query.source) leads = leads.filter(l => l.leadSource === query.source);
    if (query.executiveId) leads = leads.filter(l => l.assignedExecutiveId === query.executiveId);
    if (query.search) {
      const s = query.search.toLowerCase();
      leads = leads.filter(l =>
        l.customerName.toLowerCase().includes(s) ||
        l.mobile.includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.city.toLowerCase().includes(s),
      );
    }
    if (query.from) leads = leads.filter(l => l.createdAt >= query.from);
    if (query.to) leads = leads.filter(l => l.createdAt <= query.to);

    return leads;
  }

  findOne(id: string) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  create(dto: any, user: any) {
    const existing = this.store.getLeads().find(
      l => l.mobile === dto.mobile || l.email === dto.email,
    );
    if (existing) throw new BadRequestException('A lead with this mobile or email already exists');

    return this.store.createLead({
      ...dto,
      status: 'New',
      createdBy: user.sub,
      createdByName: dto.createdByName || 'Unknown',
      remarks: [],
    });
  }

  update(id: string, dto: any) {
    const lead = this.store.updateLead(id, dto);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  remove(id: string) {
    const deleted = this.store.deleteLead(id);
    if (!deleted) throw new NotFoundException(`Lead ${id} not found`);
    return { message: 'Lead deleted successfully' };
  }

  async assign(id: string, dto: { executiveId: string; executiveName: string }) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    const updated = this.store.updateLead(id, {
      assignedExecutiveId: dto.executiveId,
      assignedExecutiveName: dto.executiveName,
      status: 'Assigned',
    });

    // Notify assigned executive
    const execUser = this.store.getUserById(dto.executiveId);
    if (execUser) {
      const recipients = [dto.executiveId];
      if (execUser.teamLeadId) recipients.push(execUser.teamLeadId);

      await this.notificationsService.notifyUsers(recipients, {
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${lead.customerName}`,
        type: NotificationType.LEAD_ASSIGNED,
        priority: NotificationPriority.HIGH,
        module: 'Lead Management',
        referenceId: lead.id,
        actionUrl: `/leads/${lead.id}`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      });
    }

    return updated;
  }

  addRemark(id: string, dto: { text: string; followUpDate?: string; followUpTime?: string }, user: any) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);

    const remark = {
      id: `rem_${uuidv4()}`,
      text: dto.text,
      addedBy: user.sub,
      addedByName: user.name || 'Unknown',
      createdAt: new Date().toISOString(),
    };
    const updatedRemarks = [...lead.remarks, remark];
    const updateData: any = { remarks: updatedRemarks };

    // If a follow-up date is being set, store it and notify
    if (dto.followUpDate) {
      updateData.followUpDate = dto.followUpDate;
      const followUpDisplay = dto.followUpTime
        ? `${dto.followUpDate} at ${dto.followUpTime}`
        : dto.followUpDate;

      // Notify relevant people about new follow-up
      this.dispatchFollowUpCreatedNotification(lead, user, followUpDisplay);
    }

    return this.store.updateLead(id, updateData);
  }

  private async dispatchFollowUpCreatedNotification(lead: any, createdByUser: any, followUpDisplay: string) {
    const recipients: string[] = [];
    if (lead.assignedExecutiveId) recipients.push(lead.assignedExecutiveId);

    const execUser = lead.assignedExecutiveId
      ? this.store.getUserById(lead.assignedExecutiveId)
      : null;

    if (execUser?.teamLeadId) recipients.push(execUser.teamLeadId);
    if (execUser?.managerId) recipients.push(execUser.managerId);

    const uniqueRecipients = Array.from(new Set(recipients));
    if (uniqueRecipients.length === 0) return;

    await this.notificationsService.notifyUsers(uniqueRecipients, {
      title: 'Follow-up Scheduled',
      message: `A follow-up has been scheduled for lead ${lead.customerName} on ${followUpDisplay}.`,
      type: NotificationType.FOLLOW_UP_CREATED,
      priority: NotificationPriority.HIGH,
      module: 'Lead Management',
      referenceId: lead.id,
      actionUrl: `/leads/${lead.id}`,
      channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  async changeStatus(id: string, dto: { status: string }) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    const updated = this.store.updateLead(id, { status: dto.status as any });

    // Notify assigned executive about status change
    if (lead.assignedExecutiveId) {
      await this.notificationsService.notifyUser({
        title: 'Lead Status Updated',
        message: `Lead ${lead.customerName} status has been changed to "${dto.status}".`,
        type: NotificationType.LEAD_STATUS_CHANGED,
        priority: NotificationPriority.MEDIUM,
        module: 'Lead Management',
        referenceId: lead.id,
        actionUrl: `/leads/${lead.id}`,
        channel: [NotificationChannel.IN_APP],
        receiverIds: [lead.assignedExecutiveId],
      });
    }

    return updated;
  }
}
