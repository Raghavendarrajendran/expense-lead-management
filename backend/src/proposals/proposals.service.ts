import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any) {
    let proposals = this.store.getProposals();
    if (query.leadId) proposals = proposals.filter(p => p.leadId === query.leadId);
    if (query.proposalStatus) proposals = proposals.filter(p => p.proposalStatus === query.proposalStatus);
    if (query.search) {
      const s = query.search.toLowerCase();
      proposals = proposals.filter(p =>
        p.customerName.toLowerCase().includes(s) ||
        p.proposalNumber.toLowerCase().includes(s),
      );
    }
    return proposals;
  }

  findOne(id: string) {
    const proposal = this.store.getProposalById(id);
    if (!proposal) throw new NotFoundException(`Proposal ${id} not found`);
    return proposal;
  }

  create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    const count = this.store.getProposals().length + 1;
    const proposalNumber = dto.proposalNumber || `TCO-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    return this.store.createProposal({
      ...dto,
      proposalNumber,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      proposalStatus: 'Draft',
      version: 1,
      createdBy: user.sub,
      createdByName: user.name || user.email,
    });
  }

  update(id: string, dto: any) {
    const proposal = this.store.updateProposal(id, dto);
    if (!proposal) throw new NotFoundException(`Proposal ${id} not found`);
    return proposal;
  }

  remove(id: string) {
    const deleted = this.store.deleteProposal(id);
    if (!deleted) throw new NotFoundException(`Proposal ${id} not found`);
    return { message: 'Proposal deleted successfully' };
  }

  async submitForApproval(id: string, user: any) {
    const proposal = this.store.getProposalById(id);
    if (!proposal) throw new NotFoundException(`Proposal ${id} not found`);

    this.store.updateProposal(id, { proposalStatus: 'Submitted For Approval' });

    // Create approval steps for all 4 stages
    const stages = [
      { stage: 'Sales Executive', approverRole: 'sales_executive' },
      { stage: 'Manager', approverRole: 'manager' },
      { stage: 'Engineering Head', approverRole: 'engineering_user' },
      { stage: 'Commercial Admin', approverRole: 'commercial_user' },
    ];

    // Remove existing approvals for this proposal
    const existing = this.store.getProposalApprovalsByProposalId(id);
    // Create fresh steps
    for (const s of stages) {
      const existingStep = existing.find(e => e.stage === s.stage);
      if (!existingStep) {
        this.store.createProposalApproval({
          proposalId: id,
          approverRole: s.approverRole,
          approverUserId: '',
          approverName: '',
          stage: s.stage as any,
          status: 'Pending',
          comments: '',
        });
      }
    }

    // Notify managers
    const managers = this.store.getUsers().filter(u => u.roleName === 'manager');
    if (managers.length > 0) {
      await this.notificationsService.notifyUsers(managers.map(m => m.id), {
        title: 'Proposal Approval Pending',
        message: `Proposal ${proposal.proposalNumber} for ${proposal.customerName} requires your approval.`,
        type: NotificationType.PROPOSAL_APPROVAL_PENDING,
        priority: NotificationPriority.HIGH,
        module: 'Pre-Sales',
        referenceId: id,
        actionUrl: `/presales/approvals`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      });
    }

    return this.store.getProposalById(id);
  }

  async sendToCustomer(id: string, user: any) {
    const proposal = this.store.getProposalById(id);
    if (!proposal) throw new NotFoundException(`Proposal ${id} not found`);

    this.store.updateProposal(id, { proposalStatus: 'Sent To Customer' });

    await this.notificationsService.notifyUser({
      title: 'Proposal Sent to Customer',
      message: `Proposal ${proposal.proposalNumber} has been sent to ${proposal.customerName}.`,
      type: NotificationType.PROPOSAL_SENT_TO_CUSTOMER,
      priority: NotificationPriority.MEDIUM,
      module: 'Pre-Sales',
      referenceId: id,
      actionUrl: `/presales/proposals/${id}`,
      channel: [NotificationChannel.IN_APP],
      receiverIds: [proposal.createdBy],
    });

    return this.store.getProposalById(id);
  }
}
