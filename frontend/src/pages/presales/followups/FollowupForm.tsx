import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomerFollowup, getProposals, getPresalesLeads } from '../../../api/presales.api';
import toast from 'react-hot-toast';

export const FollowupForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    proposalId: '',
    leadId: '',
    customerName: '',
    followUpDate: new Date().toISOString().split('T')[0],
    communicationMode: 'Call',
    discussionSummary: '',
    customerFeedback: '',
    nextAction: '',
    nextFollowUpDate: '',
    status: 'Open',
  });

  useEffect(() => {
    getProposals()
      .then(res => setProposals(res.data.data))
      .catch(err => console.error(err));

    getPresalesLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));
  }, []);

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

  const handleLeadChange = (leadId: string) => {
    const selected = leads.find(l => l.id === leadId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        leadId,
        proposalId: '',
        customerName: selected.customerName,
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '', customerName: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadId) {
      toast.error('Please pick a customer lead/proposal to link');
      return;
    }
    setLoading(true);

    try {
      await createCustomerFollowup(formData);
      toast.success('Customer follow-up logged successfully');
      navigate('/presales/followups');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to log follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Log Customer Follow-up</h1>
          <p className="page-subtitle">Log reviews, negotiation details, and reschedule follow-up activities.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Link with Proposal Offer (Optional)</label>
            <select
              className="form-select"
              value={formData.proposalId}
              onChange={e => handleProposalChange(e.target.value)}
            >
              <option value="">-- Choose Proposal --</option>
              {proposals.map(p => (
                <option key={p.id} value={p.id}>{p.proposalNumber} - {p.customerName}</option>
              ))}
            </select>
          </div>

          {!formData.proposalId && (
            <div className="form-group">
              <label className="form-label">Or Link with Pre-Sales Lead *</label>
              <select
                className="form-select"
                value={formData.leadId}
                onChange={e => handleLeadChange(e.target.value)}
              >
                <option value="">-- Choose Lead --</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.customerName}</option>
                ))}
              </select>
            </div>
          )}

          {formData.leadId && (
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-input" readOnly value={formData.customerName} style={{ backgroundColor: '#f1f5f9' }} />
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Follow-up Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.followUpDate}
                onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mode of Communication</label>
              <select
                className="form-select"
                value={formData.communicationMode}
                onChange={e => setFormData({ ...formData, communicationMode: e.target.value })}
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">In-Person Meeting</option>
                <option value="WhatsApp">WhatsApp Message</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Discussion Summary *</label>
            <textarea
              className="form-textarea"
              required
              rows={3}
              placeholder="What was discussed during the call/meeting..."
              value={formData.discussionSummary}
              onChange={e => setFormData({ ...formData, discussionSummary: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Feedback & Concerns</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Mention pricing concerns, tech specs questions, competitor references..."
              value={formData.customerFeedback}
              onChange={e => setFormData({ ...formData, customerFeedback: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next Action Plan</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Reshare costing draft with 5% discount, get net metering forms..."
              value={formData.nextAction}
              onChange={e => setFormData({ ...formData, nextAction: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Next Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.nextFollowUpDate}
                onChange={e => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Open">Open</option>
                <option value="Waiting For Customer">Waiting For Customer</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/presales/followups')}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              Log Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
