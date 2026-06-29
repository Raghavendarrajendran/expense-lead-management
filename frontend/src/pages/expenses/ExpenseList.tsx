import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenses, submitExpense, getLimitsProgress } from '../../api/expenses.api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Eye, ArrowUpCircle, Filter, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExpenseList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<any>(null);

  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const fetchExpenses = () => {
    setLoading(true);
    getExpenses({ status, category })
      .then(res => setExpenses(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchLimits = () => {
    getLimitsProgress()
      .then(res => setLimits(res.data.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchExpenses();
    fetchLimits();
  }, [status, category]);

  const handleQuickSubmit = async (id: string) => {
    try {
      await submitExpense(id);
      toast.success('Expense claim submitted for approval!');
      fetchExpenses();
    } catch (err: any) {
      toast.error('Failed to submit expense');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Draft': return 'badge-draft';
      case 'Submitted': return 'badge-submitted';
      case 'Team Lead Approved': return 'badge-verified';
      case 'Manager Approved': return 'badge-approved';
      case 'Rejected': return 'badge-lost';
      case 'Finance Verified': return 'badge-verified';
      case 'Paid': return 'badge-converted';
      default: return 'badge-draft';
    }
  };

  return (
    <div className="expense-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Expense Reimbursements</h1>
          <p className="page-subtitle">Track and submit your travel & field operation expenses.</p>
        </div>
        {hasPermission('mod_expenses', 'create') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/expenses/new')}>
              <Plus size={16} /> Submit Expense
            </button>
          </div>
        )}
      </div>

      {limits && (limits.weeklyLimit > 0 || limits.monthlyLimit > 0) && (
        <div className="grid-cols-2 mb-4 animate-fade">
          {limits.weeklyLimit > 0 && (
            <div className="card" style={{ padding: '16px' }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Weekly Reimbursement Tracker</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  ₹{limits.weeklySpent} / ₹{limits.weeklyLimit}
                </span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  background: limits.weeklySpent >= limits.weeklyLimit ? 'var(--color-danger)' : 'var(--color-primary)', 
                  height: '100%', 
                  width: `${Math.min(100, (limits.weeklySpent / limits.weeklyLimit) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                {limits.weeklyRemaining > 0 ? `₹${limits.weeklyRemaining} remaining for this week` : 'Weekly limit reached / exceeded'}
              </div>
            </div>
          )}
          {limits.monthlyLimit > 0 && (
            <div className="card" style={{ padding: '16px' }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Monthly Reimbursement Tracker</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  ₹{limits.monthlySpent} / ₹{limits.monthlyLimit}
                </span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  background: limits.monthlySpent >= limits.monthlyLimit ? 'var(--color-danger)' : 'var(--color-navy)', 
                  height: '100%', 
                  width: `${Math.min(100, (limits.monthlySpent / limits.monthlyLimit) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                {limits.monthlyRemaining > 0 ? `₹${limits.monthlyRemaining} remaining for this month` : 'Monthly limit reached / exceeded'}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="filter-row">
            <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Team Lead Approved">Team Lead Approved</option>
              <option value="Manager Approved">Manager Approved</option>
              <option value="Finance Verified">Finance Verified</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Petrol Bill">Petrol Bill</option>
              <option value="Bus Ticket">Bus Ticket</option>
              <option value="Auto/Cab">Auto/Cab</option>
              <option value="Food">Food</option>
              <option value="Parking">Parking</option>
              <option value="Toll">Toll</option>
              <option value="Lodging">Lodging</option>
              <option value="Mobile Recharge">Mobile Recharge</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '48px 0' }}>
            <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Expense Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Executive</th>
                <th>Status</th>
                <th>Purpose / Ref</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">No expenses found matching criteria.</td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{exp.expenseDate}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{exp.category}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>₹{exp.amount}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{exp.executiveName}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(exp.status)}`}>{exp.status}</span>
                    </td>
                    <td>
                      <div className="truncate" style={{ maxWidth: '280px', fontSize: '13px' }}>
                        {exp.purposeOfVisit || 'Field prospecting'}
                        {exp.customerName && <div className="text-muted" style={{ fontSize: '11px' }}>Customer: {exp.customerName}</div>}
                      </div>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => navigate(`/expenses/${exp.id}`)} title="View Detail">
                          <Eye size={14} />
                        </button>
                        {exp.status === 'Draft' && hasPermission('mod_expenses', 'create') && (
                          <button className="btn btn-success btn-icon" onClick={() => handleQuickSubmit(exp.id)} title="Submit for Approval">
                            <ArrowUpCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
