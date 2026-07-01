import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class ChangeRequestsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any) {
    let crs = this.store.getChangeRequests();
    if (query.leadId) crs = crs.filter(c => c.leadId === query.leadId);
    if (query.approvalStatus) crs = crs.filter(c => c.approvalStatus === query.approvalStatus);
    return crs;
  }

  findOne(id: string) {
    const cr = this.store.getChangeRequestById(id);
    if (!cr) throw new NotFoundException(`Change request ${id} not found`);
    return cr;
  }

  async create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    const cr = this.store.createChangeRequest({
      ...dto,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      approvalStatus: 'Pending',
      requestedBy: user.sub,
      requestedByName: user.name || user.email,
      reviewedBy: null,
      reviewedByName: null,
      reviewedAt: null,
    });

    // Notify managers / commercial users
    await this.notificationsService.notifyRole('manager', {
      title: 'Change Request Pending Approval',
      message: `Change request for ${cr.customerName} (${dto.changeType}): ${dto.requestedValue} — requires your review.`,
      type: NotificationType.CHANGE_REQUEST_PENDING,
      priority: NotificationPriority.HIGH,
      module: 'Pre-Sales',
      referenceId: cr.id,
      actionUrl: `/presales/change-requests/${cr.id}`,
      channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });

    return cr;
  }

  async update(id: string, dto: any, user: any) {
    const existing = this.store.getChangeRequestById(id);
    if (!existing) throw new NotFoundException(`Change request ${id} not found`);

    const updateData: any = { ...dto };
    if (dto.approvalStatus && dto.approvalStatus !== existing.approvalStatus) {
      updateData.reviewedBy = user.sub;
      updateData.reviewedByName = user.name || user.email;
      updateData.reviewedAt = new Date().toISOString();
    }

    const updated = this.store.updateChangeRequest(id, updateData);

    if (dto.approvalStatus === 'Approved' || dto.approvalStatus === 'Rejected') {
      const type = dto.approvalStatus === 'Approved'
        ? NotificationType.CHANGE_REQUEST_APPROVED
        : NotificationType.PROPOSAL_REJECTED;

      await this.notificationsService.notifyUser({
        title: `Change Request ${dto.approvalStatus}`,
        message: `Your change request for ${existing.customerName} has been ${dto.approvalStatus.toLowerCase()}.`,
        type,
        priority: NotificationPriority.HIGH,
        module: 'Pre-Sales',
        referenceId: id,
        actionUrl: `/presales/change-requests/${id}`,
        channel: [NotificationChannel.IN_APP],
        receiverIds: [existing.requestedBy],
      });
    }

    return updated;
  }
}
