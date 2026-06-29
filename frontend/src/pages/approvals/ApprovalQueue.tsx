import React, { useEffect, useState } from 'react';
import { getApprovals, approveExpense, rejectExpense } from '../../api/approvals.api';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, ShieldAlert, Eye, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export const ApprovalQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal
  const [rejectingApproval, setRejectingApproval] = useState<any>(null);
  const [reason, setReason] = useState('');

  const fetchQueue = () => {
    setLoading(true);
    getApprovals()
      .then(res => setQueue(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this expense?')) return;
    try {
      await approveExpense(id);
      toast.success('Expense claim approved');
      fetchQueue();
    } catch (err: any) {
      toast.error('Failed to approve expense');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !rejectingApproval) return;
    try {
      await rejectExpense(rejectingApproval.id, reason);
      toast.success('Expense claim rejected');
      setRejectingApproval(null);
      setReason('');
      fetchQueue();
    } catch (err: any) {
      toast.error('Failed to reject expense');
    }
  };

  return (
    <div className="approval-queue animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Approval Queue</h1>
          <p className="page-subtitle">Review, approve, or reject team expense reimbursement claims.</p>
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
                <th>Current Stage</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">No pending expense approvals found in your queue.</td>
                </tr>
              ) : (
                queue.map(ap => (
                  <tr key={ap.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{ap.executiveName}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{ap.expenseCategory}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>₹{ap.amount}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{new Date(ap.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{ap.currentStage}</span>
                    </td>
                    <td>
                      <span className="badge badge-pending">{ap.status}</span>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(ap.id)} title="Approve">
                          <Check size={14} /> Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setRejectingApproval(ap)} title="Reject">
                          <X size={14} /> Reject
                        </button>
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
      {rejectingApproval && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Reject Expense Claim</h2>
              <button className="btn-icon" onClick={() => setRejectingApproval(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '12px', fontSize: '14px' }}>
                  Please specify the reason for rejecting <strong>{rejectingApproval.executiveName}'s</strong> claim of <strong>₹{rejectingApproval.amount}</strong> ({rejectingApproval.expenseCategory}).
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
                <button type="button" className="btn btn-secondary" onClick={() => setRejectingApproval(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={!reason.trim()}>Reject Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
