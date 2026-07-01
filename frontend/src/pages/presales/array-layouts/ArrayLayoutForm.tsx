import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createArrayLayout, getPresalesLeads } from '../../../api/presales.api';
import { getMasters } from '../../../api/masters.api';
import toast from 'react-hot-toast';

export const ArrayLayoutForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lead = state?.lead;

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  // Catalog item states from Master Data Management
  const [panelTypes, setPanelTypes] = useState<string[]>(['Mono PERC 540Wp', 'Bifacial 550Wp', 'Polycrystalline 330Wp', 'TopCon 575Wp']);
  const [inverterTypes, setInverterTypes] = useState<string[]>(['Growatt 10kW On-grid', 'Solis 25kW On-grid', 'Fronius 15kW Hybrid', 'Delta 50kW On-grid']);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    plantCapacity: 5.0,
    panelType: 'Mono PERC 540Wp',
    panelCount: 10,
    inverterType: 'Growatt 10kW On-grid',
    orientation: 'South',
    tiltAngle: 12,
    layoutDrawingUpload: '',
    shadowAnalysisRemarks: '',
  });

  useEffect(() => {
    getPresalesLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));

    getMasters()
      .then(res => {
        const m = res.data.data;
        if (m.panelTypes) {
          setPanelTypes(m.panelTypes);
          setFormData(prev => ({ ...prev, panelType: m.panelTypes[0] }));
        }
        if (m.inverterTypes) {
          setInverterTypes(m.inverterTypes);
          setFormData(prev => ({ ...prev, inverterType: m.inverterTypes[0] }));
        }
      })
      .catch(err => console.error('Failed to load masters, using defaults', err));

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

  const handleCapacityChange = (cap: number) => {
    // Basic solar recommendation: 540Wp panels -> Cap / 0.540 = Panel Count
    const panelWp = 540;
    const count = Math.ceil((cap * 1000) / panelWp);
    setFormData(prev => ({
      ...prev,
      plantCapacity: cap,
      panelCount: count,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createArrayLayout({
        ...formData,
        layoutDrawingUpload: formData.layoutDrawingUpload || `drawing_${formData.customerName.toLowerCase().replace(/\s+/g, '_')}_v1.pdf`,
      });
      toast.success('Array layout design draft saved');
      navigate(`/presales/leads/${formData.leadId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save array layout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Create Array Layout</h1>
          <p className="page-subtitle">Configure solar panels placement, azimuth angles, and tilt factors.</p>
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
              <label className="form-label">Design Plant Capacity (kWp) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                required
                value={formData.plantCapacity}
                onChange={e => handleCapacityChange(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Panel Type / Specifications *</label>
              <select
                className="form-select"
                required
                value={formData.panelType}
                onChange={e => setFormData({ ...formData, panelType: e.target.value })}
              >
                {panelTypes.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Calculated Panel Count</label>
              <input type="number" className="form-input" style={{ background: '#F1F5F9', cursor: 'not-allowed' }} readOnly value={formData.panelCount} />
            </div>
            <div className="form-group">
              <label className="form-label">Orientation / Azimuth *</label>
              <select
                className="form-select"
                value={formData.orientation}
                onChange={e => setFormData({ ...formData, orientation: e.target.value })}
              >
                <option value="South">South</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tilt Angle (Degrees) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.tiltAngle}
                onChange={e => setFormData({ ...formData, tiltAngle: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Inverter Specifications *</label>
            <select
              className="form-select"
              required
              value={formData.inverterType}
              onChange={e => setFormData({ ...formData, inverterType: e.target.value })}
            >
              {inverterTypes.map(inv => (
                <option key={inv} value={inv}>{inv}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Design Layout File Name (Metadata only)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. array_layout_customer_v1.pdf"
              value={formData.layoutDrawingUpload}
              onChange={e => setFormData({ ...formData, layoutDrawingUpload: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Shadow Analysis Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Specify structural details or shading obstacles from shading analysis..."
              value={formData.shadowAnalysisRemarks}
              onChange={e => setFormData({ ...formData, shadowAnalysisRemarks: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Save Design Layout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
