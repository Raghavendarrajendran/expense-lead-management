import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any) {
    let orders = this.store.getOrders();
    if (query.leadId) orders = orders.filter(o => o.leadId === query.leadId);
    if (query.orderStatus) orders = orders.filter(o => o.orderStatus === query.orderStatus);
    return orders;
  }

  findOne(id: string) {
    const order = this.store.getOrderById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async create(dto: any, user: any) {
    const proposal = this.store.getProposalById(dto.proposalId);
    const lead = dto.leadId ? this.store.getPresalesLeadById(dto.leadId) : null;

    const order = this.store.createOrder({
      ...dto,
      customerName: proposal?.customerName || lead?.customerName || dto.customerName || 'Unknown',
      orderStatus: 'PO Received',
      createdBy: user.sub,
      createdByName: user.name || user.email,
    });

    // Mark proposal as accepted
    if (proposal) {
      this.store.updateProposal(dto.proposalId, { proposalStatus: 'Accepted' });
    }

    // Create default advance payment milestones
    const milestones = [
      { milestone: '1st Advance (50%)', percentage: 50, amount: dto.finalOrderValue * 0.5 },
      { milestone: '2nd Payment on Delivery (30%)', percentage: 30, amount: dto.finalOrderValue * 0.3 },
      { milestone: 'Final Payment on Commissioning (20%)', percentage: 20, amount: dto.finalOrderValue * 0.2 },
    ];
    for (const m of milestones) {
      this.store.createAdvancePayment({
        orderId: order.id,
        leadId: dto.leadId,
        customerName: order.customerName,
        paymentMilestone: m.milestone,
        percentage: m.percentage,
        amount: m.amount,
        dueDate: dto.poDate,
        receivedDate: null,
        paymentStatus: 'Due',
        paymentProofUpload: '',
        remarks: '',
      });
    }

    // Notify
    await this.notificationsService.notifyRole('commercial_user', {
      title: 'New Order Finalized',
      message: `Order for ${order.customerName} (PO: ${dto.poNumber}) worth ₹${dto.finalOrderValue.toLocaleString()} has been finalized.`,
      type: NotificationType.ORDER_FINALIZED,
      priority: NotificationPriority.HIGH,
      module: 'Pre-Sales',
      referenceId: order.id,
      actionUrl: `/presales/orders/${order.id}`,
      channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });

    return order;
  }

  update(id: string, dto: any) {
    const order = this.store.updateOrder(id, dto);
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }
}
