import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExpense, submitExpense } from '../../api/expenses.api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Send, Calendar, MapPin, Receipt, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchExpenseDetails = () => {
    if (!id) return;
    setLoading(true);
    getExpense(id)
      .then(res => setExpense(res.data.data))
      .catch(err => {
        toast.error('Failed to load expense details');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  const handleSubmitClaim = async () => {
    if (!id) return;
    try {
      await submitExpense(id);
      toast.success('Expense claim submitted for approval!');
      fetchExpenseDetails();
    } catch (err: any) {
      toast.error('Failed to submit expense');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!expense) {
    return <div className="card">Expense claim not found.</div>;
  }

  return (
    <div className="expense-detail animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/expenses')}>
          <ArrowLeft size={14} /> Back to Expenses
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Claim: {expense.category}</h1>
          <p className="page-subtitle">Ref ID: {expense.id} | Claimed on: {expense.expenseDate}</p>
        </div>
        <div className="page-actions" style={{ alignItems: 'center' }}>
          <span className={`badge ${
            expense.status === 'Draft' ? 'badge-draft' :
            expense.status === 'Submitted' ? 'badge-submitted' :
            expense.status === 'Paid' ? 'badge-converted' :
            expense.status === 'Rejected' ? 'badge-lost' :
            'badge-verified'
          }`} style={{ padding: '8px 16px', fontSize: '13px' }}>
            {expense.status}
          </span>
          {expense.status === 'Draft' && expense.executiveId === user?.id && (
            <button className="btn btn-primary" onClick={handleSubmitClaim}>
              <Send size={14} /> Submit for Approval
            </button>
          )}
        </div>
      </div>

      <div className="grid-cols-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Expense Details
          </h3>

          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Amount</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-navy)' }}>₹{expense.amount}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Claimed By</div>
              <div style={{ fontWeight: 500 }}>{expense.executiveName}</div>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Travel Route</div>
              <div style={{ fontWeight: 500 }}>
                From: <strong>{expense.fromLocation || '—'}</strong> To: <strong>{expense.toLocation || '—'}</strong>
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Payment Mode</div>
              <div style={{ fontWeight: 500 }}>{expense.paymentMode}</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Purpose of Visit</div>
            <div style={{ fontWeight: 500 }}>{expense.purposeOfVisit || '—'}</div>
          </div>

          {/* Petrol specific details */}
          {expense.category === 'Petrol Bill' && (
            <div style={{ background: 'var(--color-surface-2)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '12px', fontWeight: 700 }}>Petrol Claim details</h4>
              <div className="form-grid-3">
                <div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Vehicle Number</div>
                  <div style={{ fontWeight: 600 }}>{expense.vehicleNumber || '—'}</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Opening / Closing KM</div>
                  <div style={{ fontWeight: 600 }}>{expense.openingKm} KM / {expense.closingKm} KM</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Total Distance</div>
                  <div style={{ fontWeight: 600 }}>{expense.totalKm} KM</div>
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: '12px' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Petrol Pump Name</div>
                  <div style={{ fontWeight: 600 }}>{expense.petrolPumpName || '—'}</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Bill Number</div>
                  <div style={{ fontWeight: 600 }}>{expense.billNumber || '—'}</div>
                </div>
              </div>
            </div>
          )}

          {expense.remarks && (
            <div style={{ marginBottom: '24px' }}>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Remarks</div>
              <div style={{ padding: '12px', background: 'var(--color-surface-2)', borderRadius: '8px' }}>
                {expense.remarks}
              </div>
            </div>
          )}

          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Receipt Attachment
          </h3>
          <div>
            {expense.receiptUrl ? (
              <img src={expense.receiptUrl} alt="Receipt" style={{ maxWidth: '320px', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
            ) : (
              <p className="text-muted" style={{ fontStyle: 'italic' }}>No receipt photo attached.</p>
            )}
          </div>
        </div>

        {/* Approval History Timeline */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Approval History
          </h3>
          <div className="timeline">
            {expense.approvalHistory.length === 0 ? (
              <p className="text-muted" style={{ fontStyle: 'italic' }}>Awaiting initial submission.</p>
            ) : (
              expense.approvalHistory.map((h: any, idx: number) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" style={{
                    background: h.action === 'Approved' || h.action === 'Verified' || h.action === 'Paid' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                    color: h.action === 'Approved' || h.action === 'Verified' || h.action === 'Paid' ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    <CheckCircle size={16} />
                  </div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="timeline-title">{h.stage} Stage</span>
                      <span className="timeline-sub">{new Date(h.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                      {h.action} by {h.byName}
                    </div>
                    {h.reason && (
                      <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', fontStyle: 'italic' }}>
                        Reason: "{h.reason}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
