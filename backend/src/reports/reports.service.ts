import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class ReportsService {
  constructor(private readonly store: InMemoryStore) {}

  getLeadReports(query: any) {
    let leads = this.store.getLeads();
    if (query.from) leads = leads.filter(l => l.createdAt >= query.from);
    if (query.to) leads = leads.filter(l => l.createdAt <= query.to);
    if (query.status) leads = leads.filter(l => l.status === query.status);
    if (query.executiveId) leads = leads.filter(l => l.assignedExecutiveId === query.executiveId);
    if (query.source) leads = leads.filter(l => l.leadSource === query.source);

    const byStatus = this.groupBy(leads, 'status');
    const bySource = this.groupBy(leads, 'leadSource');
    const byExecutive = this.groupBy(leads, 'assignedExecutiveName');
    const converted = leads.filter(l => l.status === 'Converted').length;
    const conversionRate = leads.length > 0 ? ((converted / leads.length) * 100).toFixed(1) : 0;

    return { total: leads.length, byStatus, bySource, byExecutive, converted, conversionRate, leads };
  }

  getExpenseReports(query: any) {
    let expenses = this.store.getExpenses();
    if (query.from) expenses = expenses.filter(e => e.expenseDate >= query.from);
    if (query.to) expenses = expenses.filter(e => e.expenseDate <= query.to);
    if (query.status) expenses = expenses.filter(e => e.status === query.status);
    if (query.category) expenses = expenses.filter(e => e.category === query.category);
    if (query.executiveId) expenses = expenses.filter(e => e.executiveId === query.executiveId);

    const byCategory = this.groupBySum(expenses, 'category', 'amount');
    const byExecutive = this.groupBySum(expenses, 'executiveName', 'amount');
    const byStatus = this.groupBy(expenses, 'status');
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidAmount = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);

    return { total: expenses.length, totalAmount, paidAmount, byCategory, byExecutive, byStatus, expenses };
  }

  private groupBy(arr: any[], key: string) {
    return arr.reduce((acc, item) => {
      const k = item[key] || 'Unassigned';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }

  private groupBySum(arr: any[], key: string, sumKey: string) {
    return arr.reduce((acc, item) => {
      const k = item[key] || 'Unknown';
      acc[k] = (acc[k] || 0) + item[sumKey];
      return acc;
    }, {});
  }
}
