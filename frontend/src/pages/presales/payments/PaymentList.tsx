import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdvancePayments, updateAdvancePayment } from '../../../api/presales.api';
import { useAuth } from '../../../contexts/AuthContext';
import { Download, Upload, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentList = () => {
  const { state } = useLocation();
  const { hasPermission } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Proof Modal
  const [activePayment, setActivePayment] = useState<any>(null);
  const [proofFile, setProofFile] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchPayments = () => {
    setLoading(true);
    const filter = state?.orderId ? { orderId: state.orderId } : {};
    getAdvancePayments(filter)
      .then(res => setPayments(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [state]);

  const handleVerify = async (id: string) => {
    if (!window.confirm('Verify this payment milestone as received?')) return;
    try {
      await updateAdvancePayment(id, { paymentStatus: 'Received' });
      toast.success('Milestone payment verified');
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify payment');
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return;

    try {
      await updateAdvancePayment(activePayment.id, {
        paymentProofUpload: proofFile,
        receivedDate: receiptDate,
        paymentStatus: 'Received',
      });
      toast.success('Payment proof uploaded successfully');
      setActivePayment(null);
      setProofFile('');
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update proof');
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Advance Payments</h1>
          <p className="page-subtitle">Track payment milestones, verify invoices, and confirm collections before launching projects.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : payments.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B' }}>
          No payment milestones registered.
        </div>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Milestone</th>
                <th>Amt Share</th>
                <th>Amount (₹)</th>
                <th>Due Date</th>
                <th>Received Date</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(pay => (
                <tr key={pay.id}>
                  <td><strong>{pay.customerName}</strong></td>
                  <td>{pay.paymentMilestone}</td>
                  <td>{pay.percentage}%</td>
                  <td><strong>₹{(pay.amount || 0).toLocaleString()}</strong></td>
                  <td>{new Date(pay.dueDate).toLocaleDateString()}</td>
                  <td>{pay.receivedDate ? new Date(pay.receivedDate).toLocaleDateString() : '-'}</td>
                  <td>
                    {pay.paymentProofUpload ? (
                      <span style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                        <Download size={13} /> {pay.paymentProofUpload}
                      </span>
                    ) : '-'}
                  </td>
                  <td><span className="badge badge-completed">{pay.paymentStatus}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {hasPermission('mod_ps_payments', 'track_payment') && pay.paymentStatus === 'Due' && (
                        <button className="btn btn-secondary btn-xs" onClick={() => { setActivePayment(pay); setProofFile(`proof_${pay.customerName.toLowerCase().replace(/\s+/g, '_')}_milestone.pdf`); }}>
                          <Upload size={12} style={{ marginRight: '3px' }} /> Upload Proof
                        </button>
                      )}
                      {hasPermission('mod_ps_payments', 'verify') && pay.paymentStatus === 'Received' && !pay.receivedDate && (
                        <button className="btn btn-primary btn-xs" onClick={() => handleVerify(pay.id)}>
                          <CheckCircle size={12} style={{ marginRight: '3px' }} /> Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Proof Modal */}
      {activePayment && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Upload Payment Proof</h3>
              <button className="btn-close" onClick={() => setActivePayment(null)}>&times;</button>
            </div>
            <form onSubmit={handleProofSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <div className="form-group">
                <label className="form-label">Milestone</label>
                <input type="text" className="form-input" readOnly value={`${activePayment.paymentMilestone} - ₹${activePayment.amount.toLocaleString()}`} style={{ backgroundColor: '#f1f5f9' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Proof Document Name (Metadata only)</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. wire_transfer_receipt.pdf"
                  value={proofFile}
                  onChange={e => setProofFile(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Received Date *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={receiptDate}
                  onChange={e => setReceiptDate(e.target.value)}
                />
              </div>
              <div className="modal-footer" style={{ borderTop: 'none', padding: '16px 0 0 0', margin: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActivePayment(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Proof</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
