import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createSiteVisit } from '../../api/siteVisits.api';
import { getLeads } from '../../api/leads.api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const ScheduleVisit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { leadId?: string; customerName?: string };

  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState(state?.leadId || '');
  const [customerName, setCustomerName] = useState(state?.customerName || '');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [execId, setExecId] = useState('');
  const [execName, setExecName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLeads()
      .then(res => {
        setLeads(res.data.data);
        if (state?.leadId) {
          const l = res.data.data.find((x: any) => x.id === state.leadId);
          if (l) {
            setSiteAddress(l.address + ', ' + l.city);
            setExecId(l.assignedExecutiveId || '');
            setExecName(l.assignedExecutiveName || '');
          }
        }
      })
      .catch(err => console.error(err));
  }, [state]);

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lId = e.target.value;
    setSelectedLeadId(lId);
    const l = leads.find(x => x.id === lId);
    if (l) {
      setCustomerName(l.customerName);
      setSiteAddress(l.address + ', ' + l.city + ', ' + l.state + ' - ' + l.pincode);
      setExecId(l.assignedExecutiveId || '');
      setExecName(l.assignedExecutiveName || '');
    } else {
      setCustomerName('');
      setSiteAddress('');
      setExecId('');
      setExecName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !visitDate || !visitTime || !siteAddress) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await createSiteVisit({
        leadId: selectedLeadId,
        customerName,
        visitDate,
        visitTime,
        siteAddress,
        assignedExecutiveId: execId,
        assignedExecutiveName: execName || 'Unassigned',
        feasibilityStatus: 'Pending Assessment',
      });
      toast.success('Site survey scheduled successfully!');
      navigate('/site-visits');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-visit animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/site-visits')}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Schedule Site Survey</h1>
          <p className="page-subtitle">Set up a technical site feasibility survey for a solar lead.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Select Lead / Customer <span className="required">*</span></label>
            <select className="form-select" value={selectedLeadId} onChange={handleLeadChange} required>
              <option value="">Choose a lead...</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.customerName} - {l.requirementType} ({l.city})</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Visit Date <span className="required">*</span></label>
              <input
                type="date"
                className="form-input"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Visit Time <span className="required">*</span></label>
              <input
                type="time"
                className="form-input"
                value={visitTime}
                onChange={e => setVisitTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Site Address <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Full site location address"
              value={siteAddress}
              onChange={e => setSiteAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Assigned Executive (Inherited from Lead)</label>
              <input
                type="text"
                className="form-input"
                value={execName || 'No executive assigned to this lead'}
                readOnly
                disabled
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/site-visits')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !selectedLeadId}>
              <Save size={16} /> {loading ? 'Scheduling...' : 'Schedule Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
