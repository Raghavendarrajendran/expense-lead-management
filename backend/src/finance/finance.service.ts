import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class FinanceService {
  constructor(private readonly store: InMemoryStore) {}

  getQueue() {
    return this.store.getExpenses().filter(e =>
      e.status === 'Manager Approved' || e.status === 'Finance Verified' || e.status === 'Paid',
    );
  }

  verify(id: string, user: any) {
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
    return this.store.updateExpense(id, { status: 'Finance Verified', approvalHistory: history });
  }

  reject(id: string, dto: { reason: string }, user: any) {
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
    return this.store.updateExpense(id, { status: 'Rejected', approvalHistory: history });
  }

  markAsPaid(id: string, user: any) {
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
    return this.store.updateExpense(id, { status: 'Paid', approvalHistory: history });
  }
}
