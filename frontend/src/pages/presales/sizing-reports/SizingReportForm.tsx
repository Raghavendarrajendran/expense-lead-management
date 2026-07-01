import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createSizingReport, getPresalesLeads } from '../../../api/presales.api';
import toast from 'react-hot-toast';

export const SizingReportForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lead = state?.lead;

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    requiredCapacity: 5.0,
    recommendedCapacity: 5.0,
    annualGenerationEstimate: 7300,
    performanceRatio: 80,
    moduleWattage: 540,
    inverterCapacity: 5,
    estimatedYield: 1460,
    remarks: '',
  });

  useEffect(() => {
    getPresalesLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));

    if (lead) {
      setFormData(prev => ({
        ...prev,
        leadId: lead.id,
        customerName: lead.customerName,
      }));
    }
  }, [lead]);

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

  const handleRecCapacityChange = (cap: number) => {
    // Math logic: Estimated annual generation (kWh) = Capacity (kW) * Yield factor (e.g. 1460 kWh/kWp) * Performance Ratio (e.g. 0.8)
    const yieldFactor = 1460;
    const perfRatio = formData.performanceRatio / 100;
    const estGen = Math.round(cap * yieldFactor * (perfRatio / 0.8)); // normalized to PR=80% default

    setFormData(prev => ({
      ...prev,
      recommendedCapacity: cap,
      annualGenerationEstimate: estGen,
      inverterCapacity: Math.ceil(cap),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSizingReport(formData);
      toast.success('Sizing Report successfully generated');
      navigate(`/presales/leads/${formData.leadId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save sizing report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Generate Sizing Report</h1>
          <p className="page-subtitle">Calculate system dimensions, annual yield forecasts, and module configurations.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '650px', margin: '0 auto', padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!lead && (
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
          )}

          {lead && (
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-input" style={{ background: '#F1F5F9', cursor: 'not-allowed' }} readOnly value={formData.customerName} />
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Required Plant Capacity (kWp) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                required
                value={formData.requiredCapacity}
                onChange={e => setFormData({ ...formData, requiredCapacity: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Recommended Plant Capacity (kWp) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                required
                value={formData.recommendedCapacity}
                onChange={e => handleRecCapacityChange(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Estimated Annual Yield (kWh)</label>
              <input type="number" className="form-input" style={{ background: '#F1F5F9', cursor: 'not-allowed' }} readOnly value={formData.annualGenerationEstimate} />
            </div>
            <div className="form-group">
              <label className="form-label">Performance Ratio (%) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.performanceRatio}
                onChange={e => setFormData({ ...formData, performanceRatio: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Module Wattage (Wp) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.moduleWattage}
                onChange={e => setFormData({ ...formData, moduleWattage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Recommended Inverter size (kW) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.inverterCapacity}
                onChange={e => setFormData({ ...formData, inverterCapacity: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Specific Yield factor (kWh/kWp/yr)</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.estimatedYield}
                onChange={e => setFormData({ ...formData, estimatedYield: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Design Engineer Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Enter calculations notes or special configurations..."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Generating...' : 'Save Sizing Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
