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

    // Pre-sales collections
    const psLeads = this.store.getPresalesLeads();
    const inspections = this.store.getSiteInspectionRequests();
    const surveys = this.store.getEngineeringSurveys();
    const proposals = this.store.getProposals();
    const orders = this.store.getOrders();
    const payments = this.store.getAdvancePayments();

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
        // Pre-Sales Admin Stats
        psStats: {
          totalPsLeads: psLeads.length,
          totalProposals: proposals.length,
          totalOrders: orders.length,
          totalOrderValue: orders.reduce((sum, o) => sum + o.finalOrderValue, 0),
        }
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
        // Pre-Sales Manager Stats
        psStats: {
          totalPsLeads: psLeads.length,
          pendingInspections: inspections.filter(i => i.status !== 'Completed').length,
          approvedProposals: proposals.filter(p => p.proposalStatus === 'Approved').length,
          acceptedProposals: proposals.filter(p => p.proposalStatus === 'Accepted').length,
        }
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
        leadsByStatus: this.groupBy(myLeads, 'status'),
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

    // ── Pre-Sales Role Dashboards ────────────────────────────────────
    if (roleName === 'sales_executive') {
      const myLeads = psLeads.filter(l => l.assignedSalesExecId === user.sub);
      const myProposals = proposals.filter(p => p.createdBy === user.sub);
      const myOrders = orders.filter(o => o.createdBy === user.sub);
      return {
        totalPsLeads: myLeads.length,
        qualifiedLeads: myLeads.filter(l => l.qualificationStatus === 'Qualified').length,
        pendingInspections: inspections.filter(i => i.status !== 'Completed').length,
        totalProposals: myProposals.length,
        proposalsApproved: myProposals.filter(p => p.proposalStatus === 'Approved').length,
        proposalsAccepted: myProposals.filter(p => p.proposalStatus === 'Accepted').length,
        totalOrders: myOrders.length,
        orderValue: myOrders.reduce((sum, o) => sum + o.finalOrderValue, 0),
        leadsByStatus: this.groupBy(myLeads, 'qualificationStatus'),
        proposalsByStatus: this.groupBy(myProposals, 'proposalStatus'),
      };
    }

    if (roleName === 'engineering_user') {
      const myInspections = inspections.filter(i => i.assignedEngineerId === user.sub);
      const mySurveys = surveys.filter(s => s.engineerId === user.sub);
      return {
        assignedInspections: myInspections.length,
        completedInspections: myInspections.filter(i => i.status === 'Completed').length,
        surveysPerformed: mySurveys.length,
        pendingLayouts: this.store.getArrayLayouts().filter(a => a.designStatus === 'Draft' || a.designStatus === 'Revision Required').length,
        pendingBoms: this.store.getBoms().filter(b => b.bomStatus === 'Draft' || b.bomStatus === 'Revision Required').length,
        inspectionsByStatus: this.groupBy(myInspections, 'status'),
      };
    }

    if (roleName === 'commercial_user') {
      const pendingCosting = psLeads.filter(l => l.qualificationStatus === 'Qualified' && !this.store.getCostEstimations().some(ce => ce.leadId === l.id)).length;
      const pendingApprovals = this.store.getProposalApprovals().filter(a => a.stage === 'Commercial Admin' && a.status === 'Pending').length;
      return {
        pendingCosting,
        pendingApprovals,
        totalOrders: orders.length,
        totalOrderValue: orders.reduce((sum, o) => sum + o.finalOrderValue, 0),
        duePayments: payments.filter(p => p.paymentStatus === 'Due' || p.paymentStatus === 'Overdue').length,
        paymentCollected: payments.filter(p => p.paymentStatus === 'Received').reduce((sum, p) => sum + p.amount, 0),
        ordersByStatus: this.groupBy(orders, 'orderStatus'),
        paymentsByStatus: this.groupBy(payments, 'paymentStatus'),
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
