import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, updateLead } from '../../api/leads.api';
import { getUsers } from '../../api/users.api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditLead = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    customerType: 'Residential',
    requirementType: 'Hardware Integration',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    projectBudget: 0,
    projectScale: '',
    leadSource: 'Website',
    assignedExecutiveId: '',
    assignedExecutiveName: '',
    followUpDate: '',
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getLead(id),
      getUsers({ roleId: 'role_field_executive' })
    ])
      .then(([leadRes, usersRes]) => {
        const lead = leadRes.data.data;
        setFormData({
          customerName: lead.customerName || '',
          mobile: lead.mobile || '',
          email: lead.email || '',
          customerType: lead.customerType || 'Residential',
          requirementType: lead.requirementType || 'Hardware Integration',
          location: lead.location || '',
          address: lead.address || '',
          city: lead.city || '',
          state: lead.state || '',
          pincode: lead.pincode || '',
          projectBudget: lead.projectBudget || 0,
          projectScale: lead.projectScale || '',
          leadSource: lead.leadSource || 'Website',
          assignedExecutiveId: lead.assignedExecutiveId || '',
          assignedExecutiveName: lead.assignedExecutiveName || '',
          followUpDate: lead.followUpDate || '',
        });
        setExecutives(usersRes.data.data);
      })
      .catch(err => {
        toast.error('Failed to load lead data');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'projectBudget' ? Number(value) : value,
    }));
  };

  const handleExecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const execId = e.target.value;
    const exec = executives.find(u => u.id === execId);
    setFormData(prev => ({
      ...prev,
      assignedExecutiveId: execId,
      assignedExecutiveName: exec ? exec.name : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await updateLead(id, formData);
      toast.success('Lead updated successfully');
      navigate(`/leads/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="edit-lead animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/leads/${id}`)}>
          <ArrowLeft size={14} /> Back to Lead Detail
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Edit Lead Details</h1>
          <p className="page-subtitle">Update information for customer prospect.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Customer Contact Info
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Name <span className="required">*</span></label>
              <input
                type="text"
                name="customerName"
                className="form-input"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mobile Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="mobile"
                  className="form-input"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px', fontWeight: 700 }}>
            Project Requirement Details
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select name="customerType" className="form-select" value={formData.customerType} onChange={handleChange}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Project Type</label>
              <select name="requirementType" className="form-select" value={formData.requirementType} onChange={handleChange}>
                <option value="Hardware Integration">Hardware Integration</option>
                <option value="Software Setup">Software Setup</option>
                <option value="Consulting Service">Consulting Service</option>
                <option value="Enterprise License">Enterprise License</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Project Budget (₹)</label>
              <input
                type="number"
                name="projectBudget"
                className="form-input"
                value={formData.projectBudget || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Project Scale (e.g. 5 Units)</label>
              <input
                type="text"
                name="projectScale"
                className="form-input"
                value={formData.projectScale}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lead Source</label>
              <select name="leadSource" className="form-select" value={formData.leadSource} onChange={handleChange}>
                <option value="Website">Website</option>
                <option value="Reference">Reference</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px', fontWeight: 700 }}>
            Site Location Details
          </h3>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                className="form-input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                className="form-input"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px', fontWeight: 700 }}>
            Assignment & Follow-up
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Assign Executive</label>
              <select name="assignedExecutiveId" className="form-select" value={formData.assignedExecutiveId} onChange={handleExecChange}>
                <option value="">Leave Unassigned</option>
                {executives.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Next Follow-up Date</label>
              <input
                type="date"
                name="followUpDate"
                className="form-input"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/leads/${id}`)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
