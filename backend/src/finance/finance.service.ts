import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class FinanceService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  getQueue() {
    return this.store.getExpenses().filter(e =>
      e.status === 'Manager Approved' || e.status === 'Finance Verified' || e.status === 'Paid',
    );
  }

  async verify(id: string, user: any) {
    const exp = this.store.getExpenseById(id);
    if (!exp) throw new NotFoundException(`Expense ${id} not found`);
    if (exp.status !== 'Manager Approved') throw new BadRequestException('Expense must be Manager Approved to verify');

    const history = [...exp.approvalHistory, {
      stage: 'Finance',
      action: 'Verified',
      by: user.sub,
      byName: user.name || user.email,
      timestamp: new Date().toISOString(),
    }];
    const updated = this.store.updateExpense(id, { status: 'Finance Verified', approvalHistory: history });

    // Notify the submitter
    await this.notificationsService.notifyUser({
      title: 'Expense Verified by Finance',
      message: `Your expense claim of ₹${exp.amount} (${exp.category}) has been verified by finance.`,
      type: NotificationType.FINANCE_VERIFIED,
      priority: NotificationPriority.MEDIUM,
      module: 'Finance Verification',
      referenceId: id,
      actionUrl: `/expenses/${id}`,
      channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      receiverIds: [exp.executiveId],
    });

    return updated;
  }

  async reject(id: string, dto: { reason: string }, user: any) {
    const exp = this.store.getExpenseById(id);
    if (!exp) throw new NotFoundException(`Expense ${id} not found`);
    if (!dto.reason) throw new BadRequestException('Rejection reason is required');

    const history = [...exp.approvalHistory, {
      stage: 'Finance',
      action: 'Rejected',
      by: user.sub,
      byName: user.name || user.email,
      reason: dto.reason,
      timestamp: new Date().toISOString(),
    }];
    const updated = this.store.updateExpense(id, { status: 'Rejected', approvalHistory: history });

    // Notify the submitter
    await this.notificationsService.notifyUser({
      title: 'Expense Rejected by Finance',
      message: `Your expense claim of ₹${exp.amount} has been rejected by finance. Reason: ${dto.reason}`,
      type: NotificationType.EXPENSE_REJECTED,
      priority: NotificationPriority.HIGH,
      module: 'Finance Verification',
      referenceId: id,
      actionUrl: `/expenses/${id}`,
      channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      receiverIds: [exp.executiveId],
    });

    return updated;
  }

  async markAsPaid(id: string, user: any) {
    const exp = this.store.getExpenseById(id);
    if (!exp) throw new NotFoundException(`Expense ${id} not found`);
    if (exp.status !== 'Finance Verified') throw new BadRequestException('Expense must be Finance Verified to mark as paid');

    const history = [...exp.approvalHistory, {
      stage: 'Finance',
      action: 'Paid',
      by: user.sub,
      byName: user.name || user.email,
      timestamp: new Date().toISOString(),
    }];
    const updated = this.store.updateExpense(id, { status: 'Paid', approvalHistory: history });

    // Notify the submitter
    await this.notificationsService.notifyUser({
      title: 'Reimbursement Paid 🎉',
      message: `Your reimbursement of ₹${exp.amount} (${exp.category}) has been disbursed and marked as PAID.`,
      type: NotificationType.PAYMENT_MARKED_PAID,
      priority: NotificationPriority.HIGH,
      module: 'Finance Verification',
      referenceId: id,
      actionUrl: `/expenses/${id}`,
      channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      receiverIds: [exp.executiveId],
    });

    return updated;
  }
}
