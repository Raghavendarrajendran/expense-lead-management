import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class ProposalApprovalsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any, user: any) {
    let approvals = this.store.getProposalApprovals();

    // Scope by role
    if (user.roleName === 'manager') {
      approvals = approvals.filter(a => a.stage === 'Manager' && a.status === 'Pending');
    } else if (user.roleName === 'engineering_user') {
      approvals = approvals.filter(a => a.stage === 'Engineering Head' && a.status === 'Pending');
    } else if (user.roleName === 'commercial_user') {
      approvals = approvals.filter(a => a.stage === 'Commercial Admin' && a.status === 'Pending');
    } else if (user.roleName === 'sales_executive') {
      approvals = approvals.filter(a => a.stage === 'Sales Executive' && a.status === 'Pending');
    }

    if (query.proposalId) approvals = approvals.filter(a => a.proposalId === query.proposalId);
    if (query.status) approvals = approvals.filter(a => a.status === query.status);
    return approvals;
  }

  getByProposal(proposalId: string) {
    return this.store.getProposalApprovalsByProposalId(proposalId);
  }

  async approve(id: string, dto: { comments: string }, user: any) {
    const step = this.store.getProposalApprovalById(id);
    if (!step) throw new NotFoundException(`Approval step ${id} not found`);
    if (step.status !== 'Pending') throw new BadRequestException('This step is already actioned');

    this.store.updateProposalApproval(id, {
      status: 'Approved',
      comments: dto.comments || '',
      approverUserId: user.sub,
      approverName: user.name || user.email,
      actionDate: new Date().toISOString(),
    });

    const proposal = this.store.getProposalById(step.proposalId);
    const allSteps = this.store.getProposalApprovalsByProposalId(step.proposalId);

    // Check if all steps approved
    const updated = allSteps.map(s => s.id === id ? { ...s, status: 'Approved' } : s);
    const allApproved = updated.every(s => s.status === 'Approved');

    if (allApproved) {
      this.store.updateProposal(step.proposalId, { proposalStatus: 'Approved' });
      // Notify proposal creator
      if (proposal) {
        await this.notificationsService.notifyUser({
          title: 'Proposal Fully Approved!',
          message: `Proposal ${proposal.proposalNumber} for ${proposal.customerName} has been approved by all reviewers.`,
          type: NotificationType.PROPOSAL_APPROVED,
          priority: NotificationPriority.HIGH,
          module: 'Pre-Sales',
          referenceId: proposal.id,
          actionUrl: `/presales/proposals/${proposal.id}`,
          channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          receiverIds: [proposal.createdBy],
        });
      }
    }

    return this.store.getProposalApprovalById(id);
  }

  async reject(id: string, dto: { comments: string; requireRevision?: boolean }, user: any) {
    const step = this.store.getProposalApprovalById(id);
    if (!step) throw new NotFoundException(`Approval step ${id} not found`);
    if (!dto.comments) throw new BadRequestException('Comments/reason required for rejection');

    const newStatus = dto.requireRevision ? 'Revision Required' : 'Rejected';
    this.store.updateProposalApproval(id, {
      status: newStatus,
      comments: dto.comments,
      approverUserId: user.sub,
      approverName: user.name || user.email,
      actionDate: new Date().toISOString(),
    });

    const proposal = this.store.getProposalById(step.proposalId);
    const proposalStatus = dto.requireRevision ? 'Revision Required' : 'Rejected';
    this.store.updateProposal(step.proposalId, { proposalStatus: proposalStatus as any });

    if (proposal) {
      const type = dto.requireRevision ? NotificationType.PROPOSAL_REVISION_REQUIRED : NotificationType.PROPOSAL_REJECTED;
      await this.notificationsService.notifyUser({
        title: dto.requireRevision ? 'Proposal Revision Required' : 'Proposal Rejected',
        message: `Proposal ${proposal.proposalNumber}: ${dto.comments}`,
        type,
        priority: NotificationPriority.HIGH,
        module: 'Pre-Sales',
        referenceId: proposal.id,
        actionUrl: `/presales/proposals/${proposal.id}`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        receiverIds: [proposal.createdBy],
      });
    }

    return this.store.getProposalApprovalById(id);
  }
}
