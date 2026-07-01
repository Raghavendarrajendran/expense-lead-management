import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createProposal, getPresalesLeads, getCostEstimations, getSizingReports } from '../../../api/presales.api';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProposalForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lead = state?.lead;

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    projectCapacity: 5.0,
    scopeOfWork: 'Supply, installation, and commissioning of grid-tied rooftop solar power plant including net metering.',
    technicalDetails: 'Standard solar panel array config with grid inverter.',
    commercialDetails: '',
    termsAndConditions: '1. Material delivery within 15 days.\n2. Workmanship warranty 5 years.',
    warrantyDetails: '25-year panel performance, 5-year inverter manufacturer warranty.',
    paymentTerms: '50% advance, 30% on material delivery, 20% on commissioning.',
    exclusions: 'DISCOM net metering fee, structure height extensions.',
    validityDate: '',
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
      autoPopulateStats(lead.id);
    }
  }, [lead]);

  const autoPopulateStats = async (leadId: string) => {
    try {
      const [costRes, sizeRes] = await Promise.all([
        getCostEstimations({ leadId }),
        getSizingReports({ leadId }),
      ]);

      const costList = costRes.data.data;
      const sizeList = sizeRes.data.data;

      let capacity = 5.0;
      if (sizeList && sizeList.length > 0) {
        capacity = sizeList[0].recommendedCapacity;
      }

      let commDetails = '';
      if (costList && costList.length > 0) {
        commDetails = `Final Proposal Offer Value: ₹${Math.round(costList[0].finalProjectCost).toLocaleString()} (Excl Margin Base: ₹${costList[0].subTotal.toLocaleString()})`;
      }

      setFormData(prev => ({
        ...prev,
        projectCapacity: capacity,
        commercialDetails: commDetails || prev.commercialDetails,
        technicalDetails: sizeList && sizeList.length > 0 
          ? `Recommended Capacity: ${sizeList[0].recommendedCapacity} kWp\nAnnual Generation Forecast: ${sizeList[0].annualGenerationEstimate} kWh\nPR Ratio: ${sizeList[0].performanceRatio}%\nModule Wattage: ${sizeList[0].moduleWattage} Wp\nInverter: ${sizeList[0].inverterCapacity} kW`
          : prev.technicalDetails,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeadChange = (leadId: string) => {
    const selected = leads.find(l => l.id === leadId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        leadId,
        customerName: selected.customerName,
      }));
      autoPopulateStats(leadId);
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
      await createProposal(formData);
      toast.success('Proposal Offer (TCO) draft generated successfully');
      navigate(`/presales/leads/${formData.leadId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Draft Proposal (TCO Offer)</h1>
          <p className="page-subtitle">Formulate solar project scopes, warranty agreements, commercial quotes, and exclusions.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Project Capacity (kWp) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                required
                value={formData.projectCapacity}
                onChange={e => setFormData({ ...formData, projectCapacity: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Proposal Offer Validity Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.validityDate}
                onChange={e => setFormData({ ...formData, validityDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Scope of Work *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              value={formData.scopeOfWork}
              onChange={e => setFormData({ ...formData, scopeOfWork: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technical Details & Solar Generation Estimates *</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              value={formData.technicalDetails}
              onChange={e => setFormData({ ...formData, technicalDetails: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Commercial Details & Pricing Quotes *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              placeholder="Total Project Cost, Base costs breakdown..."
              value={formData.commercialDetails}
              onChange={e => setFormData({ ...formData, commercialDetails: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Terms *</label>
            <textarea
              className="form-textarea"
              rows={2}
              required
              value={formData.paymentTerms}
              onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty Terms & Conditions *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              value={formData.warrantyDetails}
              onChange={e => setFormData({ ...formData, warrantyDetails: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Terms & Conditions *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              value={formData.termsAndConditions}
              onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Exclusions *</label>
            <textarea
              className="form-textarea"
              rows={2}
              required
              value={formData.exclusions}
              onChange={e => setFormData({ ...formData, exclusions: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={16} style={{ marginRight: '6px' }} /> Save Proposal Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
