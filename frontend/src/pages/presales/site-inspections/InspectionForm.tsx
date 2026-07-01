import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createSiteInspection, getSiteInspection, updateSiteInspection, getPresalesLeads } from '../../../api/presales.api';
import { getUsers } from '../../../api/users.api';
import toast from 'react-hot-toast';

export const InspectionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    assignedEngineerId: '',
    preferredVisitDate: '',
    siteAddress: '',
    inspectionPurpose: 'Roof audit for solar installation',
    priority: 'Medium',
    status: 'Requested',
  });

  useEffect(() => {
    getPresalesLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));

    getUsers({ roleId: 'role_engineering_user' })
      .then(res => setEngineers(res.data.data))
      .catch(err => console.error(err));

    if (isEdit) {
      setLoading(true);
      getSiteInspection(id!)
        .then(res => {
          const d = res.data.data;
          setFormData({
            leadId: d.leadId || '',
            customerName: d.customerName || '',
            assignedEngineerId: d.assignedEngineerId || '',
            preferredVisitDate: d.preferredVisitDate ? d.preferredVisitDate.substring(0, 10) : '',
            siteAddress: d.siteAddress || '',
            inspectionPurpose: d.inspectionPurpose || '',
            priority: d.priority || 'Medium',
            status: d.status || 'Requested',
          });
        })
        .catch(err => {
          toast.error('Failed to load inspection request');
          navigate('/presales/inspection-requests');
        })
        .finally(() => setLoading(false));
    } else if (state?.lead) {
      setFormData(prev => ({
        ...prev,
        leadId: state.lead.id,
        customerName: state.lead.customerName,
        siteAddress: state.lead.address || '',
      }));
    }
  }, [id, isEdit]);

  const handleLeadChange = (leadId: string) => {
    const selected = leads.find(l => l.id === leadId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        leadId,
        customerName: selected.customerName,
        siteAddress: selected.address || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '', customerName: '', siteAddress: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const eng = engineers.find(u => u.id === formData.assignedEngineerId);
    const payload = {
      ...formData,
      assignedEngineerName: eng ? eng.name : null,
      assignedEngineerId: formData.assignedEngineerId || null,
    };

    try {
      if (isEdit) {
        await updateSiteInspection(id!, payload);
        toast.success('Inspection request updated successfully');
      } else {
        await createSiteInspection(payload);
        toast.success('Site inspection requested successfully');
      }
      navigate('/presales/inspection-requests');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isEdit ? 'Update Site Inspection' : 'Request Site Inspection'}</h1>
          <p className="page-subtitle">Schedule engineering audits and assign solar design engineers.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '650px', margin: '0 auto', padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isEdit && !state?.lead && (
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
                  <option key={l.id} value={l.id}>{l.customerName} ({l.mobile})</option>
                ))}
              </select>
            </div>
          )}

          { (isEdit || state?.lead) && (
            <div className="form-group">
              <label className="form-label">Lead / Customer</label>
              <input type="text" className="form-input" style={{ background: '#F1F5F9', cursor: 'not-allowed' }} readOnly value={formData.customerName} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Site Address *</label>
            <textarea
              className="form-textarea"
              required
              rows={2}
              value={formData.siteAddress}
              onChange={e => setFormData({ ...formData, siteAddress: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Preferred Visit Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.preferredVisitDate}
                onChange={e => setFormData({ ...formData, preferredVisitDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assign Solar Engineer</label>
              <select
                className="form-select"
                value={formData.assignedEngineerId}
                onChange={e => setFormData({ ...formData, assignedEngineerId: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {engineers.map(e => (
                  <option key={e.id} value={e.id}>{e.name} (Engineer)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            {isEdit && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Requested">Requested</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rework Required">Rework Required</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Audit Instructions / Purpose</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.inspectionPurpose}
              onChange={e => setFormData({ ...formData, inspectionPurpose: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/presales/inspection-requests')}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
