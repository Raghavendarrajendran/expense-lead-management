import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPresalesLead, getPresalesLead, updatePresalesLead } from '../../../api/presales.api';
import { getLeads } from '../../../api/leads.api';
import { getUsers } from '../../../api/users.api';
import { getMasters } from '../../../api/masters.api';
import toast from 'react-hot-toast';

export const LeadQualForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [originalLeads, setOriginalLeads] = useState<any[]>([]);
  const [salesExecs, setSalesExecs] = useState<any[]>([]);

  // Lookup option states
  const [sources, setSources] = useState<string[]>(['Website', 'Reference', 'Cold Call', 'Social Media', 'Expo/Event']);
  const [types, setTypes] = useState<string[]>(['Residential', 'Commercial', 'Industrial', 'Agricultural']);
  const [categories, setCategories] = useState<string[]>(['Standard', 'Premium', 'Enterprise']);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    mobile: '',
    email: '',
    location: '',
    address: '',
    city: '',
    state: '',
    leadSource: 'Website',
    customerType: 'Residential',
    customerCategory: 'Standard',
    budget: 0,
    decisionMakerName: '',
    decisionMakerPhone: '',
    expectedCloseDate: '',
    probability: 50,
    competitor: '',
    requirementSummary: '',
    remarks: '',
    assignedSalesExecId: '',
  });

  useEffect(() => {
    // Fetch regular CRM leads to offer linking
    getLeads()
      .then(res => setOriginalLeads(res.data.data))
      .catch(err => console.error(err));

    // Fetch Sales Execs for assignments
    getUsers({ roleId: 'role_sales_executive' })
      .then(res => setSalesExecs(res.data.data))
      .catch(err => console.error(err));

    // Fetch Masters lookup tables
    getMasters()
      .then(res => {
        const m = res.data.data;
        if (m.leadSources) setSources(m.leadSources);
        if (m.customerTypes) setTypes(m.customerTypes);
        if (m.customerCategories) setCategories(m.customerCategories);
      })
      .catch(err => console.error('Failed to load lookup masters, using defaults', err));

    if (isEdit) {
      setLoading(true);
      getPresalesLead(id)
        .then(res => {
          const d = res.data.data;
          setFormData({
            leadId: d.leadId || '',
            customerName: d.customerName || '',
            mobile: d.mobile || '',
            email: d.email || '',
            location: d.location || '',
            address: d.address || '',
            city: d.city || '',
            state: d.state || '',
            leadSource: d.leadSource || 'Website',
            customerType: d.customerType || 'Residential',
            customerCategory: d.customerCategory || 'Standard',
            budget: d.budget || 0,
            decisionMakerName: d.decisionMakerName || '',
            decisionMakerPhone: d.decisionMakerPhone || '',
            expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.substring(0, 10) : '',
            probability: d.probability || 50,
            competitor: d.competitor || '',
            requirementSummary: d.requirementSummary || '',
            remarks: d.remarks || '',
            assignedSalesExecId: d.assignedSalesExecId || '',
          });
        })
        .catch(err => {
          toast.error('Failed to load lead details');
          navigate('/presales/leads');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // When a CRM lead is picked, auto-populate details
  const handleCrmLeadChange = (leadId: string) => {
    const selected = originalLeads.find(l => l.id === leadId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        leadId,
        customerName: selected.customerName || '',
        mobile: selected.mobile || '',
        email: selected.email || '',
        location: selected.location || '',
        city: selected.city || '',
        state: selected.state || '',
        requirementSummary: selected.requirementSummary || selected.requirement || '',
        leadSource: selected.leadSource || selected.source || 'Website',
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const exec = salesExecs.find(u => u.id === formData.assignedSalesExecId);
    const payload = {
      ...formData,
      assignedSalesExecName: exec ? exec.name : null,
      assignedSalesExecId: formData.assignedSalesExecId || null,
    };

    try {
      if (isEdit) {
        await updatePresalesLead(id, payload);
        toast.success('Pre-sales lead updated successfully');
      } else {
        await createPresalesLead(payload);
        toast.success('Pre-sales lead created successfully');
      }
      navigate('/presales/leads');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex-center" style={{ minHeight: '40vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
      </div>
    );
  }

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isEdit ? 'Edit Pre-Sales Lead' : 'Create Pre-Sales Lead'}</h1>
          <p className="page-subtitle">Enrich prospect details with qualification and target specifications.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '750px', margin: '0 auto', padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Link with Existing CRM Lead (Optional)</label>
              <select
                className="form-select"
                value={formData.leadId}
                onChange={e => handleCrmLeadChange(e.target.value)}
              >
                <option value="">-- Create Fresh Pre-Sales Lead --</option>
                {originalLeads.map(l => (
                  <option key={l.id} value={l.id}>{l.customerName} ({l.mobile})</option>
                ))}
              </select>
            </div>
          )}

          <h3 style={{ margin: '12px 0 0px 0', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Customer Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer/Company Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lead Source</label>
              <select
                className="form-select"
                value={formData.leadSource}
                onChange={e => setFormData({ ...formData, leadSource: e.target.value })}
              >
                {sources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Site Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Area / Location</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <h3 style={{ margin: '12px 0 0px 0', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Pre-Sales Qualification Metrics</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select
                className="form-select"
                value={formData.customerType}
                onChange={e => setFormData({ ...formData, customerType: e.target.value as any })}
              >
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Customer Category</label>
              <select
                className="form-select"
                value={formData.customerCategory}
                onChange={e => setFormData({ ...formData, customerCategory: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Project Budget (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Win Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={formData.probability}
                onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Decision Maker Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.decisionMakerName}
                onChange={e => setFormData({ ...formData, decisionMakerName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Decision Maker Phone</label>
              <input
                type="text"
                className="form-input"
                value={formData.decisionMakerPhone}
                onChange={e => setFormData({ ...formData, decisionMakerPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Expected Close Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expectedCloseDate}
                onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Competitor</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tata Power Solar"
                value={formData.competitor}
                onChange={e => setFormData({ ...formData, competitor: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Sales Executive</label>
            <select
              className="form-select"
              value={formData.assignedSalesExecId}
              onChange={e => setFormData({ ...formData, assignedSalesExecId: e.target.value })}
            >
              <option value="">-- Leave Unassigned --</option>
              {salesExecs.map(exec => (
                <option key={exec.id} value={exec.id}>{exec.name} ({exec.designation || 'Sales'})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Solar Capacity / Requirement Summary</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. 10 kWp off-grid solar required with battery backup for warehouse"
              value={formData.requirementSummary}
              onChange={e => setFormData({ ...formData, requirementSummary: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/presales/leads')}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
