import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder, getProposals } from '../../../api/presales.api';
import toast from 'react-hot-toast';

export const OrderForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const proposal = state?.proposal;

  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    proposalId: '',
    leadId: '',
    customerName: '',
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    poUpload: '',
    finalOrderValue: 0,
    orderStatus: 'PO Received',
  });

  useEffect(() => {
    getProposals({ proposalStatus: 'Approved' })
      .then(res => setProposals(res.data.data))
      .catch(err => console.error(err));

    if (proposal) {
      setFormData(prev => ({
        ...prev,
        proposalId: proposal.id,
        leadId: proposal.leadId,
        customerName: proposal.customerName,
      }));
    }
  }, [proposal]);

  const handleProposalChange = (propId: string) => {
    const selected = proposals.find(p => p.id === propId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        proposalId: propId,
        leadId: selected.leadId,
        customerName: selected.customerName,
      }));
    } else {
      setFormData(prev => ({ ...prev, proposalId: '', leadId: '', customerName: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposalId) {
      toast.error('Please link to an approved proposal');
      return;
    }
    setLoading(true);

    try {
      await createOrder({
        ...formData,
        poUpload: formData.poUpload || `po_${formData.customerName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      });
      toast.success('Order finalized and milestones created successfully');
      navigate('/presales/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to finalize purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Finalize Purchase Order</h1>
          <p className="page-subtitle">Formulate handover parameters, register purchase orders (PO), and trigger payments.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!proposal && (
            <div className="form-group">
              <label className="form-label">Select Approved Proposal *</label>
              <select
                className="form-select"
                required
                value={formData.proposalId}
                onChange={e => handleProposalChange(e.target.value)}
              >
                <option value="">-- Choose Approved Proposal --</option>
                {proposals.map(p => (
                  <option key={p.id} value={p.id}>{p.proposalNumber} - {p.customerName}</option>
                ))}
              </select>
            </div>
          )}

          {(proposal || formData.customerName) && (
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-input" readOnly value={formData.customerName} style={{ backgroundColor: '#f1f5f9' }} />
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">PO Number *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. PO/2026/894"
                value={formData.poNumber}
                onChange={e => setFormData({ ...formData, poNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">PO Receipt Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.poDate}
                onChange={e => setFormData({ ...formData, poDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Final Negotiated Project Value (₹) *</label>
            <input
              type="number"
              className="form-input"
              required
              value={formData.finalOrderValue}
              onChange={e => setFormData({ ...formData, finalOrderValue: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PO Copy Upload (Metadata name)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. purchase_order_customer.pdf"
              value={formData.poUpload}
              onChange={e => setFormData({ ...formData, poUpload: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              Register Order & Build Milestones
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
