import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class AdvancePaymentsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any) {
    let payments = this.store.getAdvancePayments();
    if (query.orderId) payments = payments.filter(p => p.orderId === query.orderId);
    if (query.leadId) payments = payments.filter(p => p.leadId === query.leadId);
    if (query.paymentStatus) payments = payments.filter(p => p.paymentStatus === query.paymentStatus);
    return payments;
  }

  findOne(id: string) {
    const payment = this.store.getAdvancePaymentById(id);
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  create(dto: any) {
    return this.store.createAdvancePayment({ ...dto, paymentStatus: 'Due' });
  }

  async update(id: string, dto: any, user: any) {
    const existing = this.store.getAdvancePaymentById(id);
    if (!existing) throw new NotFoundException(`Payment ${id} not found`);

    const updated = this.store.updateAdvancePayment(id, dto);

    if (dto.paymentStatus === 'Received' && existing.paymentStatus !== 'Received') {
      await this.notificationsService.notifyRole('sales_executive', {
        title: 'Payment Received',
        message: `Payment received for ${existing.customerName}: ${existing.paymentMilestone} (₹${existing.amount.toLocaleString()}).`,
        type: NotificationType.PAYMENT_RECEIVED,
        priority: NotificationPriority.HIGH,
        module: 'Pre-Sales',
        referenceId: id,
        actionUrl: `/presales/payments`,
        channel: [NotificationChannel.IN_APP],
      });
    }

    return updated;
  }
}
