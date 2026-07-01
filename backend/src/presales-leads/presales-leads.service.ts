import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class PresalesLeadsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any, user: any) {
    let leads = this.store.getPresalesLeads();

    // Scope: sales execs see only their leads
    if (user.roleName === 'sales_executive') {
      leads = leads.filter(l => l.assignedSalesExecId === user.sub);
    }

    if (query.status) leads = leads.filter(l => l.qualificationStatus === query.status);
    if (query.customerType) leads = leads.filter(l => l.customerType === query.customerType);
    if (query.search) {
      const s = query.search.toLowerCase();
      leads = leads.filter(l =>
        l.customerName.toLowerCase().includes(s) ||
        l.mobile?.includes(s) ||
        l.email?.toLowerCase().includes(s) ||
        l.city?.toLowerCase().includes(s),
      );
    }

    return leads;
  }

  findOne(id: string) {
    const lead = this.store.getPresalesLeadById(id);
    if (!lead) throw new NotFoundException(`Pre-sales lead ${id} not found`);
    return lead;
  }

  create(dto: any, user: any) {
    return this.store.createPresalesLead({
      ...dto,
      qualificationStatus: 'New',
      createdBy: user.sub,
      createdByName: user.name || user.email,
    });
  }

  update(id: string, dto: any) {
    const lead = this.store.updatePresalesLead(id, dto);
    if (!lead) throw new NotFoundException(`Pre-sales lead ${id} not found`);
    return lead;
  }

  remove(id: string) {
    const deleted = this.store.deletePresalesLead(id);
    if (!deleted) throw new NotFoundException(`Pre-sales lead ${id} not found`);
    return { message: 'Pre-sales lead deleted successfully' };
  }

  async qualify(id: string, dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(id);
    if (!lead) throw new NotFoundException(`Pre-sales lead ${id} not found`);

    const updated = this.store.updatePresalesLead(id, {
      qualificationStatus: dto.status || 'Qualified',
      remarks: dto.remarks || lead.remarks,
      probability: dto.probability !== undefined ? dto.probability : lead.probability,
      expectedCloseDate: dto.expectedCloseDate || lead.expectedCloseDate,
    });

    // Notify relevant parties
    if (lead.assignedSalesExecId && lead.assignedSalesExecId !== user.sub) {
      await this.notificationsService.notifyUser({
        title: 'Lead Qualification Updated',
        message: `Lead ${lead.customerName} has been marked as "${dto.status || 'Qualified'}" by ${user.name || user.email}.`,
        type: NotificationType.LEAD_STATUS_CHANGED,
        priority: NotificationPriority.MEDIUM,
        module: 'Pre-Sales',
        referenceId: lead.id,
        actionUrl: `/presales/lead-qualification/${lead.id}`,
        channel: [NotificationChannel.IN_APP],
        receiverIds: [lead.assignedSalesExecId],
      });
    }

    return updated;
  }

  async assign(id: string, dto: { salesExecId: string; salesExecName: string }) {
    const lead = this.store.getPresalesLeadById(id);
    if (!lead) throw new NotFoundException(`Pre-sales lead ${id} not found`);

    const updated = this.store.updatePresalesLead(id, {
      assignedSalesExecId: dto.salesExecId,
      assignedSalesExecName: dto.salesExecName,
    });

    await this.notificationsService.notifyUser({
      title: 'Pre-Sales Lead Assigned',
      message: `You have been assigned the pre-sales lead: ${lead.customerName}`,
      type: NotificationType.LEAD_ASSIGNED,
      priority: NotificationPriority.HIGH,
      module: 'Pre-Sales',
      referenceId: lead.id,
      actionUrl: `/presales/lead-qualification/${lead.id}`,
      channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      receiverIds: [dto.salesExecId],
    });

    return updated;
  }
}
