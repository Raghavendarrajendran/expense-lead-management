import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationChannel } from '../notifications/enums/notification-channel.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(query: any, user: any) {
    let expenses = this.store.getExpenses();

    // Field executives see only their own expenses
    if (user.roleName === 'field_executive') {
      expenses = expenses.filter(e => e.executiveId === user.sub);
    }

    if (query.status) expenses = expenses.filter(e => e.status === query.status);
    if (query.category) expenses = expenses.filter(e => e.category === query.category);
    if (query.executiveId) expenses = expenses.filter(e => e.executiveId === query.executiveId);
    if (query.from) expenses = expenses.filter(e => e.expenseDate >= query.from);
    if (query.to) expenses = expenses.filter(e => e.expenseDate <= query.to);

    return expenses;
  }

  findOne(id: string) {
    const exp = this.store.getExpenseById(id);
    if (!exp) throw new NotFoundException(`Expense ${id} not found`);
    return exp;
  }

  create(dto: any, user: any) {
    if (dto.status !== 'Draft') {
      this.checkRoleLimits(user.sub, dto.amount, dto.expenseDate, user.roleName);
    }
    return this.store.createExpense({
      ...dto,
      executiveId: user.sub,
      executiveName: dto.executiveName || 'Unknown',
      status: dto.status || 'Draft',
      approvalHistory: [],
    });
  }

  update(id: string, dto: any, user: any) {
    const exp = this.store.getExpenseById(id);
    if (!exp) throw new NotFoundException(`Expense ${id} not found`);
    if (user.roleName === 'field_executive' && exp.executiveId !== user.sub) {
      throw new ForbiddenException('Cannot edit another executive\'s expense');
    }
    return this.store.updateExpense(id, dto);
  }

  submit(id: string, user: any) {
    const exp = this.store.getExpenseById(id);
    if (!exp) throw new NotFoundException(`Expense ${id} not found`);
    if (exp.status !== 'Draft') throw new ForbiddenException('Only draft expenses can be submitted');

    this.checkRoleLimits(user.sub, exp.amount, exp.expenseDate, user.roleName);

    const updated = this.store.updateExpense(id, { status: 'Submitted' });

    // Create approval record
    this.store.createApproval({
      expenseId: id,
      expenseCategory: exp.category,
      executiveId: exp.executiveId,
      executiveName: exp.executiveName,
      amount: exp.amount,
      currentStage: 'Team Lead',
      status: 'Pending Team Lead Approval',
      history: [],
    });

    // Notify team lead and manager about new expense submission
    const execUser = this.store.getUserById(exp.executiveId);
    const recipients: string[] = [];
    if (execUser?.teamLeadId) recipients.push(execUser.teamLeadId);
    if (execUser?.managerId) recipients.push(execUser.managerId);
    if (recipients.length > 0) {
      this.notificationsService.notifyUsers(recipients, {
        title: 'Expense Claim Submitted',
        message: `${exp.executiveName} submitted an expense claim of ₹${exp.amount} (${exp.category}) for your approval.`,
        type: NotificationType.EXPENSE_SUBMITTED,
        priority: NotificationPriority.HIGH,
        module: 'Expense Management',
        referenceId: id,
        actionUrl: `/approvals`,
        channel: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      });
    }

    return updated;
  }

  getLimitsProgress(user: any) {
    const dbUser = this.store.getUsers().find(u => u.id === user.sub);
    if (!dbUser) throw new NotFoundException('User not found');

    const limit = this.store.getRoleLimitByRoleId(dbUser.roleId) || { weeklyLimit: 0, monthlyLimit: 0 };

    const target = new Date();
    const day = target.getDay();
    const diffToMonday = target.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(target.setDate(diffToMonday));
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const startOfMonth = new Date(target.getFullYear(), target.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);

    const userExpenses = this.store.getExpenses().filter(e => e.executiveId === user.sub && e.status !== 'Rejected' && e.status !== 'Draft');

    let weeklyTotal = 0;
    let monthlyTotal = 0;

    userExpenses.forEach(e => {
      const eDate = new Date(e.expenseDate);
      const eTime = eDate.getTime();

      if (eTime >= startOfWeek.getTime() && eTime <= endOfWeek.getTime()) {
        weeklyTotal += e.amount;
      }
      if (eTime >= startOfMonth.getTime() && eTime <= endOfMonth.getTime()) {
        monthlyTotal += e.amount;
      }
    });

    return {
      weeklyLimit: limit.weeklyLimit,
      monthlyLimit: limit.monthlyLimit,
      weeklySpent: weeklyTotal,
      monthlySpent: monthlyTotal,
      weeklyRemaining: limit.weeklyLimit > 0 ? Math.max(0, limit.weeklyLimit - weeklyTotal) : 0,
      monthlyRemaining: limit.monthlyLimit > 0 ? Math.max(0, limit.monthlyLimit - monthlyTotal) : 0,
    };
  }

  private checkRoleLimits(userId: string, amount: number, dateStr: string, userRoleName: string) {
    const user = this.store.getUsers().find(u => u.id === userId);
    if (!user) return;

    const limit = this.store.getRoleLimitByRoleId(user.roleId);
    if (!limit) return; // No limit configured

    const target = new Date(dateStr);
    const day = target.getDay();
    const diffToMonday = target.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(target.setDate(diffToMonday));
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const startOfMonth = new Date(target.getFullYear(), target.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sum of all user's expenses (submitted, approved, verified, paid) excluding current week/month rejections
    const userExpenses = this.store.getExpenses().filter(e => e.executiveId === userId && e.status !== 'Rejected' && e.status !== 'Draft');

    let weeklyTotal = 0;
    let monthlyTotal = 0;

    userExpenses.forEach(e => {
      const eDate = new Date(e.expenseDate);
      const eTime = eDate.getTime();

      if (eTime >= startOfWeek.getTime() && eTime <= endOfWeek.getTime()) {
        weeklyTotal += e.amount;
      }
      if (eTime >= startOfMonth.getTime() && eTime <= endOfMonth.getTime()) {
        monthlyTotal += e.amount;
      }
    });

    if (limit.weeklyLimit > 0 && (weeklyTotal + amount) > limit.weeklyLimit) {
      throw new BadRequestException(
        `Weekly reimbursement limit of ₹${limit.weeklyLimit} exceeded for role ${userRoleName}. (Spent this week: ₹${weeklyTotal}, attempting to file: ₹${amount})`
      );
    }

    if (limit.monthlyLimit > 0 && (monthlyTotal + amount) > limit.monthlyLimit) {
      throw new BadRequestException(
        `Monthly reimbursement limit of ₹${limit.monthlyLimit} exceeded for role ${userRoleName}. (Spent this month: ₹${monthlyTotal}, attempting to file: ₹${amount})`
      );
    }
  }
}
