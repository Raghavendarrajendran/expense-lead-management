import React, { useEffect, useState } from 'react';
import { getFinanceQueue, verifyExpense, rejectFinance, markAsPaid } from '../../api/finance.api';
import { Check, X, ShieldAlert, DollarSign, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export const FinanceQueue = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal
  const [rejectingItem, setRejectingItem] = useState<any>(null);
  const [reason, setReason] = useState('');

  const fetchQueue = () => {
    setLoading(true);
    getFinanceQueue()
      .then(res => setQueue(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleVerify = async (id: string) => {
    if (!window.confirm('Are you sure you want to verify this expense claim?')) return;
    try {
      await verifyExpense(id);
      toast.success('Expense claim verified successfully');
      fetchQueue();
    } catch (err: any) {
      toast.error('Failed to verify expense');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!window.confirm('Are you sure you want to mark this expense claim as Paid?')) return;
    try {
      await markAsPaid(id);
      toast.success('Expense reimbursement marked as Paid!');
      fetchQueue();
    } catch (err: any) {
      toast.error('Failed to update status to Paid');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !rejectingItem) return;
    try {
      await rejectFinance(rejectingItem.id, reason);
      toast.success('Expense claim rejected by Finance');
      setRejectingItem(null);
      setReason('');
      fetchQueue();
    } catch (err: any) {
      toast.error('Failed to reject expense');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Manager Approved': return 'badge-pending';
      case 'Finance Verified': return 'badge-verified';
      case 'Paid': return 'badge-converted';
      case 'Rejected': return 'badge-lost';
      default: return 'badge-draft';
    }
  };

  return (
    <div className="finance-queue animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Finance queue</h1>
          <p className="page-subtitle">Verify manager-approved claims and disburse payments.</p>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="flex-center" style={{ padding: '48px 0' }}>
            <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Executive</th>
                <th>Expense Category</th>
                <th>Amount</th>
                <th>Claim Date</th>
                <th>Status</th>
                <th>Associated Lead</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">No expense claims require finance action.</td>
                </tr>
              ) : (
                queue.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.executiveName}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{item.category}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>₹{item.amount}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{item.expenseDate}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px' }}>{item.customerName || 'None'}</span>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {item.status === 'Manager Approved' && (
                          <>
                            <button className="btn btn-navy btn-sm" onClick={() => handleVerify(item.id)} title="Verify">
                              <Check size={14} /> Verify
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setRejectingItem(item)} title="Reject">
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        {item.status === 'Finance Verified' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleMarkAsPaid(item.id)} title="Mark Paid">
                            <Wallet size={14} /> Mark Paid
                          </button>
                        )}
                        {item.status === 'Paid' && (
                          <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '12px' }}>Paid Reimbursement</span>
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

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Reject Expense Claim</h2>
              <button className="btn-icon" onClick={() => setRejectingItem(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '12px', fontSize: '14px' }}>
                  Please specify the reason for rejecting <strong>{rejectingItem.executiveName}'s</strong> claim of <strong>₹{rejectingItem.amount}</strong> ({rejectingItem.category}).
                </p>
                <div className="form-group">
                  <label className="form-label">Rejection Reason <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter reason..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRejectingItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={!reason.trim()}>Reject Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
