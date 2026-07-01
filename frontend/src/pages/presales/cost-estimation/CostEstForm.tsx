import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCostEstimation, getPresalesLeads, getBoms } from '../../../api/presales.api';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const CostEstForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lead = state?.lead;

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    materialCost: 0,
    labourCost: 25000,
    transportationCost: 5000,
    civilCost: 10000,
    installationCost: 15000,
    overheadCost: 5000,
    marginPercentage: 15,
    taxPercentage: 18,
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
      // Try to auto-populate material cost from BOM if present
      getBoms({ leadId: lead.id })
        .then(res => {
          const list = res.data.data;
          if (list && list.length > 0) {
            setFormData(prev => ({ ...prev, materialCost: list[0].totalAmount }));
            toast.success(`Material cost auto-populated from BOM: ₹${list[0].totalAmount.toLocaleString()}`);
          }
        })
        .catch(err => console.error(err));
    }
  }, [lead]);

  const handleLeadChange = async (leadId: string) => {
    const selected = leads.find(l => l.id === leadId);
    if (selected) {
      let matCost = 0;
      try {
        const bomRes = await getBoms({ leadId });
        const list = bomRes.data.data;
        if (list && list.length > 0) {
          matCost = list[0].totalAmount;
          toast.success(`Material cost auto-populated from BOM: ₹${matCost.toLocaleString()}`);
        }
      } catch (err) {
        console.error(err);
      }
      setFormData(prev => ({
        ...prev,
        leadId,
        customerName: selected.customerName,
        materialCost: matCost,
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '', customerName: '', materialCost: 0 }));
    }
  };

  // Real-time calculation helpers
  const subTotal = formData.materialCost + formData.labourCost + formData.transportationCost + formData.civilCost + formData.installationCost + formData.overheadCost;
  const marginAmount = subTotal * (formData.marginPercentage / 100);
  const totalBeforeTax = subTotal + marginAmount;
  const taxAmount = totalBeforeTax * (formData.taxPercentage / 100);
  const finalProjectCost = totalBeforeTax + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadId) {
      toast.error('Please select a project lead');
      return;
    }
    setLoading(true);

    try {
      await createCostEstimation(formData);
      toast.success('Cost estimation generated successfully');
      navigate(`/presales/leads/${formData.leadId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit costing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Generate Cost Estimation</h1>
          <p className="page-subtitle">Configure engineering material base, implementation costs, margins, and taxation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card">
          {!lead && (
            <div className="form-group" style={{ maxWidth: '400px' }}>
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
            <div className="form-group" style={{ maxWidth: '400px' }}>
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-input" style={{ background: '#F1F5F9', cursor: 'not-allowed' }} readOnly value={formData.customerName} />
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Inputs Panel */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '15px', textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>Direct Cost Components</h3>
            <div className="form-group">
              <label className="form-label">Material Base Cost (₹) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.materialCost}
                onChange={e => setFormData({ ...formData, materialCost: Number(e.target.value) })}
              />
            </div>
            <div className="form-grid" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Labour Cost (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={formData.labourCost}
                  onChange={e => setFormData({ ...formData, labourCost: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transportation Cost (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={formData.transportationCost}
                  onChange={e => setFormData({ ...formData, transportationCost: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-grid-3" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Civil works (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.civilCost}
                  onChange={e => setFormData({ ...formData, civilCost: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Installation (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.installationCost}
                  onChange={e => setFormData({ ...formData, installationCost: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Overheads (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.overheadCost}
                  onChange={e => setFormData({ ...formData, overheadCost: Number(e.target.value) })}
                />
              </div>
            </div>

            <h3 style={{ marginTop: '24px', fontSize: '15px', textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>Commercial Config</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Margin Percentage (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  required
                  value={formData.marginPercentage}
                  onChange={e => setFormData({ ...formData, marginPercentage: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Percentage (GST %) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  required
                  value={formData.taxPercentage}
                  onChange={e => setFormData({ ...formData, taxPercentage: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Real-time Summary Panel */}
          <div className="card" style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ borderBottom: '1px solid #FEF3C7', paddingBottom: '10px' }}>Calculation Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Material Costs:</span>
                  <span>₹{formData.materialCost.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Implementation Costs:</span>
                  <span>₹{(formData.labourCost + formData.transportationCost + formData.civilCost + formData.installationCost + formData.overheadCost).toLocaleString()}</span>
                </div>
                <hr style={{ borderColor: '#FEF3C7' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Gross Cost Subtotal:</span>
                  <span>₹{subTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Commercial Margin ({formData.marginPercentage}%):</span>
                  <span>₹{marginAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Base Price (Excl. Tax):</span>
                  <span>₹{totalBeforeTax.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Tax / GST ({formData.taxPercentage}%):</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '15px' }}>Final Project Price:</strong>
                <strong style={{ fontSize: '20px', color: '#10B981' }}>₹{Math.round(finalProjectCost).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            Save Pricing Estimate
          </button>
        </div>
      </form>
    </div>
  );
};
