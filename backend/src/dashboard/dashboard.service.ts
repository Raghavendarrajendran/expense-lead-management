import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class DashboardService {
  constructor(private readonly store: InMemoryStore) {}

  getStats(user: any) {
    const leads = this.store.getLeads();
    const expenses = this.store.getExpenses();
    const users = this.store.getUsers();
    const approvals = this.store.getApprovals();

    const roleName = user.roleName;

    if (roleName === 'admin') {
      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalLeads: leads.length,
        totalExpenses: expenses.length,
        pendingApprovals: approvals.filter(a => a.currentStage !== 'Closed').length,
        paidExpenses: expenses.filter(e => e.status === 'Paid').length,
        leadsByStatus: this.groupBy(leads, 'status'),
        expensesByCategory: this.groupBySum(expenses, 'category', 'amount'),
      };
    }

    if (roleName === 'manager') {
      return {
        totalLeads: leads.length,
        assignedLeads: leads.filter(l => l.assignedExecutiveId).length,
        pendingFollowUps: leads.filter(l => l.status === 'Contacted' || l.status === 'Field Visit Scheduled').length,
        siteVisitsCompleted: this.store.getSiteVisits().filter(s => s.status === 'Completed').length,
        pendingExpenseApprovals: approvals.filter(a => a.currentStage === 'Manager').length,
        leadsByStatus: this.groupBy(leads, 'status'),
        expensesByCategory: this.groupBySum(expenses, 'category', 'amount'),
      };
    }

    if (roleName === 'team_lead') {
      return {
        teamLeads: leads.length,
        teamSiteVisits: this.store.getSiteVisits().length,
        teamPendingFollowUps: leads.filter(l => l.status === 'Contacted').length,
        teamExpenseApprovals: approvals.filter(a => a.currentStage === 'Team Lead').length,
        leadsByStatus: this.groupBy(leads, 'status'),
      };
    }

    if (roleName === 'field_executive') {
      const myLeads = leads.filter(l => l.assignedExecutiveId === user.sub);
      const myExpenses = expenses.filter(e => e.executiveId === user.sub);
      return {
        assignedLeads: myLeads.length,
        todayFollowUps: myLeads.filter(l => l.followUpDate === new Date().toISOString().split('T')[0]).length,
        upcomingSiteVisits: this.store.getSiteVisits().filter(s => s.assignedExecutiveId === user.sub && s.status === 'Scheduled').length,
        submittedExpenses: myExpenses.filter(e => e.status !== 'Draft').length,
        approvedExpenses: myExpenses.filter(e => e.status === 'Manager Approved' || e.status === 'Finance Verified').length,
        paidReimbursements: myExpenses.filter(e => e.status === 'Paid').length,
        myExpensesByStatus: this.groupBy(myExpenses, 'status'),
      };
    }

    if (roleName === 'finance_user') {
      return {
        approvedExpenses: expenses.filter(e => e.status === 'Manager Approved').length,
        pendingVerification: expenses.filter(e => e.status === 'Manager Approved').length,
        paidExpenses: expenses.filter(e => e.status === 'Paid').length,
        rejectedExpenses: expenses.filter(e => e.status === 'Rejected').length,
        monthlyReimbursement: expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0),
        expensesByCategory: this.groupBySum(expenses, 'category', 'amount'),
      };
    }

    return {};
  }

  private groupBy(arr: any[], key: string) {
    return arr.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
  }

  private groupBySum(arr: any[], key: string, sumKey: string) {
    return arr.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + item[sumKey];
      return acc;
    }, {});
  }
}
