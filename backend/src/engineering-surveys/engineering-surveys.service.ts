import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class EngineeringSurveysService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any, user: any) {
    let surveys = this.store.getEngineeringSurveys();
    if (user.roleName === 'engineering_user') {
      surveys = surveys.filter(s => s.engineerId === user.sub);
    }
    if (query.leadId) surveys = surveys.filter(s => s.leadId === query.leadId);
    if (query.feasibilityStatus) surveys = surveys.filter(s => s.feasibilityStatus === query.feasibilityStatus);
    return surveys;
  }

  findOne(id: string) {
    const survey = this.store.getEngineeringSurveyById(id);
    if (!survey) throw new NotFoundException(`Engineering survey ${id} not found`);
    return survey;
  }

  async create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    const survey = this.store.createEngineeringSurvey({
      ...dto,
      engineerId: user.sub,
      engineerName: user.name || user.email,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
    });

    // Update inspection request status to Completed
    if (dto.inspectionRequestId) {
      this.store.updateSiteInspectionRequest(dto.inspectionRequestId, { status: 'Completed' });
    }

    // Notify requestor
    const inspection = dto.inspectionRequestId ? this.store.getSiteInspectionRequestById(dto.inspectionRequestId) : null;
    if (inspection) {
      await this.notificationsService.notifyUser({
        title: 'Engineering Survey Completed',
        message: `Engineering survey for ${survey.customerName} is completed. Feasibility: ${dto.feasibilityStatus}.`,
        type: NotificationType.INSPECTION_COMPLETED,
        priority: NotificationPriority.HIGH,
        module: 'Pre-Sales',
        referenceId: survey.id,
        actionUrl: `/presales/engineering-surveys/${survey.id}`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        receiverIds: [inspection.requestedBy],
      });
    }

    return survey;
  }

  update(id: string, dto: any) {
    const survey = this.store.updateEngineeringSurvey(id, dto);
    if (!survey) throw new NotFoundException(`Engineering survey ${id} not found`);
    return survey;
  }
}
