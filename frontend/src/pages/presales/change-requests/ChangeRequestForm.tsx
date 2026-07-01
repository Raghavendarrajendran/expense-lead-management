import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChangeRequest, getPresalesLeads } from '../../../api/presales.api';
import toast from 'react-hot-toast';

export const ChangeRequestForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    changeType: 'Capacity Change',
    oldValue: '',
    requestedValue: '',
    reason: '',
    impactOnBOM: 'Minor layout adjustment, cable quantity updates.',
    impactOnCost: 'Negligible',
  });

  useEffect(() => {
    getPresalesLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleLeadChange = (leadId: string) => {
    const selected = leads.find(l => l.id === leadId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        leadId,
        customerName: selected.customerName,
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '', customerName: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadId) {
      toast.error('Please select a project lead');
      return;
    }
    setLoading(true);

    try {
      await createChangeRequest(formData);
      toast.success('Change request raised successfully');
      navigate('/presales/change-requests');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to raise request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Raise Change Request</h1>
          <p className="page-subtitle">Submit specification alterations and track implementation impacts.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Select Pre-Sales Lead *</label>
            <select
              className="form-select"
              required
              value={formData.leadId}
              onChange={e => handleLeadChange(e.target.value)}
            >
              <option value="">-- Choose Lead --</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.customerName}</option>
              ))}
            </select>
          </div>

          {formData.leadId && (
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-input" readOnly value={formData.customerName} style={{ backgroundColor: '#f1f5f9' }} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Change Type *</label>
            <select
              className="form-select"
              value={formData.changeType}
              onChange={e => setFormData({ ...formData, changeType: e.target.value })}
            >
              <option value="Specification Change">Specification Change</option>
              <option value="Capacity Change">Capacity Change (kWp)</option>
              <option value="Scope Change">Scope Change</option>
              <option value="Commercial Change">Commercial Change</option>
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Current (Old) Value *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. 5 kWp Mono PERC"
                value={formData.oldValue}
                onChange={e => setFormData({ ...formData, oldValue: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Requested (New) Value *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. 8 kWp Bifacial Panels"
                value={formData.requestedValue}
                onChange={e => setFormData({ ...formData, requestedValue: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Change *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              placeholder="Enter explanation for specification change..."
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Impact on BOM</label>
            <input
              type="text"
              className="form-input"
              value={formData.impactOnBOM}
              onChange={e => setFormData({ ...formData, impactOnBOM: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Impact on Pricing / Cost</label>
            <input
              type="text"
              className="form-input"
              value={formData.impactOnCost}
              onChange={e => setFormData({ ...formData, impactOnCost: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/presales/change-requests')}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              Raise Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
