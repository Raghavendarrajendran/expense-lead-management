import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class ApprovalsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any, user: any) {
    let approvals = this.store.getApprovals();

    if (user.roleName === 'team_lead') {
      approvals = approvals.filter(a => a.currentStage === 'Team Lead');
    } else if (user.roleName === 'manager') {
      approvals = approvals.filter(a => a.currentStage === 'Manager');
    }

    if (query.status) approvals = approvals.filter(a => a.status === query.status);
    return approvals;
  }

  findOne(id: string) {
    const rec = this.store.getApprovalById(id);
    if (!rec) throw new NotFoundException(`Approval ${id} not found`);
    return rec;
  }

  getHistory(id: string) {
    return this.findOne(id).history;
  }

  approve(id: string, user: any) {
    const rec = this.store.getApprovalById(id);
    if (!rec) throw new NotFoundException(`Approval ${id} not found`);

    const entry = {
      stage: rec.currentStage,
      action: 'Approved',
      by: user.sub,
      byName: user.name || user.email,
      timestamp: new Date().toISOString(),
    };
    const history = [...rec.history, entry];

    let nextStage: any = rec.currentStage;
    let nextStatus = rec.status;
    let expenseStatus: any = rec.status;

    if (rec.currentStage === 'Team Lead') {
      nextStage = 'Manager';
      nextStatus = 'Pending Manager Approval';
      expenseStatus = 'Team Lead Approved';
    } else if (rec.currentStage === 'Manager') {
      nextStage = 'Finance';
      nextStatus = 'Pending Finance Verification';
      expenseStatus = 'Manager Approved';
    }

    this.store.updateApproval(id, { currentStage: nextStage, status: nextStatus, history });
    this.store.updateExpense(rec.expenseId, { status: expenseStatus });

    return this.store.getApprovalById(id);
  }

  reject(id: string, dto: { reason: string }, user: any) {
    const rec = this.store.getApprovalById(id);
    if (!rec) throw new NotFoundException(`Approval ${id} not found`);
    if (!dto.reason) throw new BadRequestException('Rejection reason is required');

    const entry = {
      stage: rec.currentStage,
      action: 'Rejected',
      by: user.sub,
      byName: user.name || user.email,
      reason: dto.reason,
      timestamp: new Date().toISOString(),
    };
    const history = [...rec.history, entry];

    this.store.updateApproval(id, { currentStage: 'Closed', status: 'Rejected', history });
    this.store.updateExpense(rec.expenseId, { status: 'Rejected' });

    return this.store.getApprovalById(id);
  }
}
