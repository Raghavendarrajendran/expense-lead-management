import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class SiteInspectionRequestsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any, user: any) {
    let requests = this.store.getSiteInspectionRequests();
    if (user.roleName === 'engineering_user') {
      requests = requests.filter(r => r.assignedEngineerId === user.sub);
    }
    if (query.status) requests = requests.filter(r => r.status === query.status);
    if (query.priority) requests = requests.filter(r => r.priority === query.priority);
    if (query.leadId) requests = requests.filter(r => r.leadId === query.leadId);
    return requests;
  }

  findOne(id: string) {
    const req = this.store.getSiteInspectionRequestById(id);
    if (!req) throw new NotFoundException(`Site inspection request ${id} not found`);
    return req;
  }

  async create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    const request = this.store.createSiteInspectionRequest({
      ...dto,
      requestedBy: user.sub,
      requestedByName: user.name || user.email,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      status: 'Requested',
    });

    // Notify assigned engineer if already set
    if (dto.assignedEngineerId) {
      await this.notificationsService.notifyUser({
        title: 'Site Inspection Assigned',
        message: `You have been assigned a site inspection for ${request.customerName} on ${dto.preferredVisitDate}.`,
        type: NotificationType.INSPECTION_ASSIGNED,
        priority: NotificationPriority.HIGH,
        module: 'Pre-Sales',
        referenceId: request.id,
        actionUrl: `/presales/site-inspections/${request.id}`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        receiverIds: [dto.assignedEngineerId],
      });
    }

    return request;
  }

  async update(id: string, dto: any, user: any) {
    const existing = this.store.getSiteInspectionRequestById(id);
    if (!existing) throw new NotFoundException(`Site inspection request ${id} not found`);

    const updated = this.store.updateSiteInspectionRequest(id, dto);

    // Notify engineer when newly assigned
    if (dto.assignedEngineerId && dto.assignedEngineerId !== existing.assignedEngineerId) {
      await this.notificationsService.notifyUser({
        title: 'Site Inspection Assigned to You',
        message: `Site inspection for ${existing.customerName} on ${existing.preferredVisitDate} has been assigned to you.`,
        type: NotificationType.INSPECTION_ASSIGNED,
        priority: NotificationPriority.HIGH,
        module: 'Pre-Sales',
        referenceId: id,
        actionUrl: `/presales/site-inspections/${id}`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        receiverIds: [dto.assignedEngineerId],
      });
    }

    // Notify requestor when completed
    if (dto.status === 'Completed' && existing.status !== 'Completed') {
      await this.notificationsService.notifyUser({
        title: 'Site Inspection Completed',
        message: `Site inspection for ${existing.customerName} has been completed by ${user.name || user.email}.`,
        type: NotificationType.INSPECTION_COMPLETED,
        priority: NotificationPriority.MEDIUM,
        module: 'Pre-Sales',
        referenceId: id,
        actionUrl: `/presales/site-inspections/${id}`,
        channel: [NotificationChannel.IN_APP],
        receiverIds: [existing.requestedBy],
      });
    }

    return updated;
  }

  remove(id: string) {
    const deleted = this.store.deleteSiteInspectionRequest(id);
    if (!deleted) throw new NotFoundException(`Site inspection request ${id} not found`);
    return { message: 'Site inspection request deleted' };
  }
}
