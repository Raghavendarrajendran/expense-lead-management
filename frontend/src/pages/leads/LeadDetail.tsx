import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, addLeadRemark, changeLeadStatus } from '../../api/leads.api';
import { getSiteVisits } from '../../api/siteVisits.api';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Receipt, Shield, Send, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [lead, setLead] = useState<any>(null);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const fetchLeadData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([getLead(id), getSiteVisits({ leadId: id })])
      .then(([leadRes, visitsRes]) => {
        setLead(leadRes.data.data);
        setNewStatus(leadRes.data.data.status);
        setSiteVisits(visitsRes.data.data);
      })
      .catch(err => {
        toast.error('Failed to load lead details');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim() || !id) return;
    try {
      await addLeadRemark(id, { text: remark });
      toast.success('Remark added successfully');
      setRemark('');
      fetchLeadData();
    } catch (err: any) {
      toast.error('Failed to add remark');
    }
  };

  const handleStatusChange = async (statusVal: string) => {
    if (!id) return;
    try {
      await changeLeadStatus(id, statusVal);
      toast.success(`Status updated to ${statusVal}`);
      fetchLeadData();
    } catch (err: any) {
      toast.error('Failed to change status');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!lead) {
    return <div className="card">Lead not found.</div>;
  }

  return (
    <div className="lead-detail animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads')}>
          <ArrowLeft size={14} /> Back to Leads
        </button>
      </div>

      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{lead.customerName}</h1>
          <p className="page-subtitle">Lead ID: {lead.id} | Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="page-actions" style={{ alignItems: 'center' }}>
          {hasPermission('mod_leads', 'change_status') && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="form-label" style={{ margin: 0 }}>Lead Status:</span>
              <select
                className="filter-select"
                value={newStatus}
                onChange={e => {
                  setNewStatus(e.target.value);
                  handleStatusChange(e.target.value);
                }}
              >
                <option value="New">New</option>
                <option value="Assigned">Assigned</option>
                <option value="Contacted">Contacted</option>
                <option value="Field Visit Scheduled">Field Visit Scheduled</option>
                <option value="Field Visit Completed">Field Visit Completed</option>
                <option value="Quotation Shared">Quotation Shared</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid-cols-3 mb-4">
        {/* Customer & Location */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Customer Details
          </h3>
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Phone</div>
              <div style={{ fontWeight: 500 }}>{lead.mobile}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontWeight: 500 }}>{lead.email}</div>
            </div>
          </div>
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Customer Type</div>
              <div style={{ fontWeight: 500 }}>{lead.customerType}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Lead Source</div>
              <div style={{ fontWeight: 500 }}>{lead.leadSource}</div>
            </div>
          </div>
          <div className="form-grid">
            <div style={{ gridColumn: 'span 2' }}>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Address</div>
              <div style={{ fontWeight: 500 }}>{lead.address}, {lead.city}, {lead.state} - {lead.pincode}</div>
            </div>
          </div>
        </div>

        {/* Project Requirement Details */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Requirements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Project Type</div>
              <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{lead.requirementType}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Project Scale</div>
              <div style={{ fontWeight: 500 }}>{lead.projectScale}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Project Budget</div>
              <div style={{ fontWeight: 600 }}>₹{lead.projectBudget}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Executive</div>
              <div style={{ fontWeight: 500 }}>{lead.assignedExecutiveName || 'Unassigned'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-cols-3">
        {/* Remarks & Remarks Timeline */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Remarks & Follow-ups</h3>
          <form onSubmit={handleAddRemark} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add follow-up remarks..."
              value={remark}
              onChange={e => setRemark(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-navy">
              <Send size={16} /> Send
            </button>
          </form>

          <div style={{
            background: 'rgba(37,99,235,0.06)',
            border: '1px solid rgba(37,99,235,0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#1E3A8A',
            marginBottom: '20px',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ℹ️ Notification & Remark Routing
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li><strong>Remarks:</strong> Saved directly to the public history log below.</li>
              <li><strong>Scheduled Follow-ups:</strong> Set dates via "Edit Lead" to alert the <strong>Assigned Executive</strong> ({lead.assignedExecutiveName || 'Unassigned'}), their <strong>Team Lead</strong>, and <strong>Manager</strong>.</li>
              <li><strong>Automatic Reminders:</strong> Sent 24 hours prior, 1 hour prior, and when overdue.</li>
            </ul>
          </div>

          <div className="timeline">
            {lead.remarks.length === 0 ? (
              <p className="text-muted">No follow-up remarks recorded.</p>
            ) : (
              [...lead.remarks].reverse().map((r: any) => (
                <div key={r.id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: 'var(--color-surface-2)', color: 'var(--color-navy)' }}>
                    {r.addedByName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="timeline-title">{r.addedByName}</span>
                      <span className="timeline-sub">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ marginTop: '4px', fontSize: '13.5px' }}>{r.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Site Visits */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Field Visits</h3>
            {hasPermission('mod_site_visits', 'create') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/site-visits/new', { state: { leadId: lead.id, customerName: lead.customerName } })}
              >
                <Plus size={14} /> Schedule
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {siteVisits.length === 0 ? (
              <p className="text-muted">No field visits scheduled.</p>
            ) : (
              siteVisits.map(visit => (
                <div key={visit.id} className="card" style={{ padding: '12px', background: 'var(--color-surface-2)' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <span className="badge badge-scheduled">{visit.status}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{visit.visitDate} {visit.visitTime}</span>
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      <MapPin size={12} /> {visit.siteAddress}
                    </div>
                    {visit.feasibilityStatus && (
                      <div><strong>Feasibility:</strong> {visit.feasibilityStatus}</div>
                    )}
                    {visit.visitRemarks && (
                      <div className="text-muted" style={{ fontStyle: 'italic', marginTop: '4px' }}>"{visit.visitRemarks}"</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
