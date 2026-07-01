import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPresalesLead, getSiteInspections, getEngineeringSurveys, getArrayLayouts, getSizingReports, getBoms, getCostEstimations, getProposals, getPresalesDocuments } from '../../../api/presales.api';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, User, FileText, CheckCircle, Clock, AlertCircle, ArrowLeft, Plus, MapPin, Download, Package, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeadQualDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [lead, setLead] = useState<any>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [sizing, setSizing] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const leadRes = await getPresalesLead(id!);
      setLead(leadRes.data.data);

      const [insRes, survRes, layRes, sizRes, bomRes, costRes, propRes, docRes] = await Promise.all([
        getSiteInspections({ leadId: id }),
        getEngineeringSurveys({ leadId: id }),
        getArrayLayouts({ leadId: id }),
        getSizingReports({ leadId: id }),
        getBoms({ leadId: id }),
        getCostEstimations({ leadId: id }),
        getProposals({ leadId: id }),
        getPresalesDocuments({ leadId: id }),
      ]);

      setInspections(insRes.data.data);
      setSurveys(survRes.data.data);
      setLayouts(layRes.data.data);
      setSizing(sizRes.data.data);
      setBoms(bomRes.data.data);
      setCosts(costRes.data.data);
      setProposals(propRes.data.data);
      setDocuments(docRes.data.data);
    } catch (err: any) {
      toast.error('Failed to load lead details');
      navigate('/presales/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const getStatusClass = (st: string) => {
    switch (st) {
      case 'New': return 'badge-new';
      case 'Qualified': return 'badge-completed';
      case 'Disqualified': return 'badge-lost';
      case 'Site Inspection Required': return 'badge-scheduled';
      default: return 'badge-draft';
    }
  };

  // Pipeline flow tracking checks
  const isQualified = lead.qualificationStatus === 'Qualified' || lead.qualificationStatus === 'Site Inspection Required' || lead.qualificationStatus === 'Proposal Pending' || lead.qualificationStatus === 'Proposal Sent' || lead.qualificationStatus === 'Order Finalized';
  const hasInspection = inspections.length > 0;
  const hasSurvey = surveys.length > 0;
  const hasLayout = layouts.length > 0;
  const hasSizing = sizing.length > 0;
  const hasBom = boms.length > 0;
  const hasCosting = costs.length > 0;
  const hasProposal = proposals.length > 0;
  const isApproved = proposals.some(p => p.proposalStatus === 'Approved');
  const isOrdered = lead.qualificationStatus === 'Order Finalized' || proposals.some(p => p.proposalStatus === 'Accepted');

  const steps = [
    { key: 'qual', label: 'Qualified', status: isQualified ? 'completed' : 'active' },
    { key: 'inspect', label: 'Feasibility Req', status: hasInspection ? 'completed' : (isQualified ? 'active' : 'pending') },
    { key: 'survey', label: 'Site Survey', status: hasSurvey ? 'completed' : (hasInspection ? 'active' : 'pending') },
    { key: 'design', label: 'Array Design', status: hasLayout ? 'completed' : (hasSurvey ? 'active' : 'pending') },
    { key: 'sizing', label: 'Sizing Yield', status: hasSizing ? 'completed' : (hasLayout ? 'active' : 'pending') },
    { key: 'bom', label: 'BOM Build', status: hasBom ? 'completed' : (hasSizing ? 'active' : 'pending') },
    { key: 'costing', label: 'Pricing Estimate', status: hasCosting ? 'completed' : (hasBom ? 'active' : 'pending') },
    { key: 'proposal', label: 'TCO Offer', status: hasProposal ? 'completed' : (hasCosting ? 'active' : 'pending') },
    { key: 'approved', label: 'Approval Sign-off', status: isApproved ? 'completed' : (hasProposal ? 'active' : 'pending') },
    { key: 'final', label: 'PO Finalized', status: isOrdered ? 'completed' : (isApproved ? 'active' : 'pending') },
  ];

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const connectorWidthPercent = Math.min(100, Math.max(0, (completedCount / (steps.length - 1)) * 100));

  const renderNextActionBanner = () => {
    if (lead.qualificationStatus === 'New' || lead.qualificationStatus === 'Disqualified') {
      return (
        <div className="card" style={{ borderLeft: '4px solid #F59E0B', background: '#FFFDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#D97706', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={16} /> Next Action: Qualify Lead</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Review contact details and select the project categories to qualify this lead.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/presales/leads/${lead.id}/edit`)}>
            Qualify Lead Now
          </button>
        </div>
      );
    }
    if (lead.qualificationStatus === 'Site Inspection Required' && !hasInspection) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #2563EB', background: '#EFF6FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#1D4ED8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Next Action: Schedule Site Inspection</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Assign a field engineering specialist to visit the site location for audit survey checks.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/inspection-requests/new', { state: { lead } })}>
            Request Site Inspection
          </button>
        </div>
      );
    }
    if (hasInspection && !hasSurvey) {
      const activeInspection = inspections.find(i => i.status !== 'Completed') || inspections[0];
      return (
        <div className="card" style={{ borderLeft: '4px solid #3B82F6', background: '#F0FDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Next Action: Complete Engineering Site Survey</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Input structural layout types, shadows analysis, load restrictions, and GPS coordinates.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/engineering-surveys/new', { state: { inspection: activeInspection } })}>
            Complete Feasibility Survey
          </button>
        </div>
      );
    }
    if (hasSurvey && !hasLayout) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #2563EB', background: '#EFF6FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#1D4ED8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16} /> Next Action: Design Solar Array Layout</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Configure orientation azimuth details, tilt angles, and upload layout drawings.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/array-layouts/new', { state: { lead } })}>
            Create Array Layout
          </button>
        </div>
      );
    }
    if (hasLayout && !hasSizing) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #8B5CF6', background: '#F5F3FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#6D28D9', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Next Action: Generate Sizing & Yield Report</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Verify annual generation estimates, recommended capacities, and inverter sizes.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/sizing-reports/new', { state: { lead } })}>
            Create Sizing Report
          </button>
        </div>
      );
    }
    if (hasSizing && !hasBom) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #10B981', background: '#ECFDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#047857', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={16} /> Next Action: Build Bill of Materials (BOM)</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Specify module types, inverters, structural cables, and vendor purchase rates.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/bom/new', { state: { lead } })}>
            Build BOM Checklist
          </button>
        </div>
      );
    }
    if (hasBom && !hasCosting) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #F59E0B', background: '#FFFDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#D97706', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Next Action: Perform Cost Estimation</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Apply commercial overheads, installation charges, profit margins, and GST rates.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/costing/new', { state: { lead } })}>
            Generate Cost Estimate
          </button>
        </div>
      );
    }
    if (hasCosting && !hasProposal) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #2563EB', background: '#EFF6FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#1D4ED8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Next Action: Compile TCO Proposal Offer</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Build the formal solar quotation with scope, terms, exclusions, and warranty clauses.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/proposals/new', { state: { lead } })}>
            Draft Proposal
          </button>
        </div>
      );
    }
    if (hasProposal && !isApproved) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #F59E0B', background: '#FFFDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#D97706', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Next Action: Obtain Internal Proposal Approval</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Submit the proposal to managers or commercial heads for sign-off review.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/proposal-approvals')}>
            Review Approvals Queue
          </button>
        </div>
      );
    }
    if (isApproved && !isOrdered) {
      return (
        <div className="card" style={{ borderLeft: '4px solid #10B981', background: '#ECFDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#047857', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Next Action: Finalize Customer Order (PO Handover)</h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748B' }}>Log the final Purchase Order details and collect the first milestone payment.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/presales/orders/new', { state: { lead } })}>
            Log Purchase Order
          </button>
        </div>
      );
    }
    return (
      <div className="card" style={{ borderLeft: '4px solid #10B981', background: '#F0FDF4', padding: '16px 20px', marginBottom: '20px' }}>
        <h4 style={{ color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Project Pipeline Completed!</h4>
        <p style={{ fontSize: '13px', color: '#15803D', marginTop: '4px', marginBottom: 0 }}>This solar project is fully qualified, sized, quoted, approved, and finalized.</p>
      </div>
    );
  };

  if (loading || !lead) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="lead-detail-page animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/leads')}>
          <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back to Qualification List
        </button>
      </div>

      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">{lead.customerName}</h1>
            <span className={`badge ${getStatusClass(lead.qualificationStatus)}`}>
              {lead.qualificationStatus}
            </span>
          </div>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>
            Pre-Sales CRM Lifecycle Details • ID: {lead.id}
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          {hasPermission('mod_ps_leads', 'edit') && (
            <button className="btn btn-secondary" onClick={() => navigate(`/presales/leads/${lead.id}/edit`)}>
              Edit Details
            </button>
          )}
          {hasPermission('mod_ps_inspection_req', 'request_inspection') && lead.qualificationStatus === 'Site Inspection Required' && (
            <button className="btn btn-primary" onClick={() => navigate('/presales/inspection-requests/new', { state: { lead } })}>
              <MapPin size={14} style={{ marginRight: '6px' }} /> Request Site Inspection
            </button>
          )}
        </div>
      </div>

      {/* Visual Progress Pipeline Tracker */}
      <div className="pipeline-tracker">
        <div className="pipeline-connector">
          <div className="pipeline-connector-progress" style={{ width: `${connectorWidthPercent}%` }}></div>
        </div>
        {steps.map((s, idx) => (
          <div key={s.key} className="pipeline-step">
            <div className={`step-node ${s.status}`}>
              {s.status === 'completed' ? '✓' : idx + 1}
            </div>
            <span className={`step-label ${s.status}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Recommended Next Action Banner */}
      {renderNextActionBanner()}

      {/* Tabs */}
      <div className="card" style={{ padding: '0', marginBottom: '20px', background: '#fff', border: '1px solid var(--color-border)' }}>
        <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          {[
            { id: 'overview', label: 'Lead Overview', icon: <User size={14} /> },
            { id: 'technical', label: 'Technical (Inspections & Design)', icon: <Layers size={14} /> },
            { id: 'commercial', label: 'Commercial (BOM & Cost)', icon: <Package size={14} /> },
            { id: 'proposal', label: 'Offer & Proposal', icon: <FileText size={14} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 20px',
                fontSize: '14px',
                fontWeight: 500,
                color: activeTab === t.id ? '#2563EB' : '#64748B',
                borderBottom: activeTab === t.id ? '2px solid #2563EB' : '2px solid transparent',
                borderRadius: '0',
                transition: 'all 0.15s ease',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ marginBottom: '16px' }}>Enriched Pre-Sales Profile</h3>
                <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Customer Type</span>
                    <strong style={{ fontSize: '15px' }}>{lead.customerType}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Customer Category</span>
                    <strong style={{ fontSize: '15px' }}>{lead.customerCategory}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Project Budget</span>
                    <strong style={{ fontSize: '15px', color: '#10B981' }}>₹{(lead.budget || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Win Probability</span>
                    <strong style={{ fontSize: '15px' }}>{lead.probability || 0}%</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Expected Close Date</span>
                    <strong style={{ fontSize: '15px' }}>{lead.expectedCloseDate ? new Date(lead.expectedCloseDate).toLocaleDateString() : 'TBD'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Competitor Threat</span>
                    <strong style={{ fontSize: '15px', color: lead.competitor ? '#EF4444' : 'inherit' }}>{lead.competitor || 'None'}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Requirement Summary</span>
                  <p style={{ background: '#F8FAFC', padding: '12px', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6' }}>
                    {lead.requirementSummary || 'No technical requirement details submitted yet.'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Remarks / Qualifiers</span>
                  <p style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', padding: '12px', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6' }}>
                    {lead.remarks || 'No evaluation remarks registered.'}
                  </p>
                </div>
              </div>

              {/* Side contact card */}
              <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '24px' }}>
                <h4 style={{ marginBottom: '16px' }}>Contact & Stakeholder</h4>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Mobile</span>
                  <span>{lead.mobile}</span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Email</span>
                  <span style={{ wordBreak: 'break-all' }}>{lead.email || 'N/A'}</span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Decision Maker</span>
                  <strong>{lead.decisionMakerName || 'Same as lead'}</strong>
                  {lead.decisionMakerPhone && <div style={{ fontSize: '12px', color: '#64748B' }}>Tel: {lead.decisionMakerPhone}</div>}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Assigned Sales Executive</span>
                  <span>{lead.assignedSalesExecName || <span style={{ color: '#94A3B8' }}>Unassigned</span>}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Created By</span>
                  <span style={{ fontSize: '13px' }}>{lead.createdByName} on {new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* TECHNICAL TAB */}
          {activeTab === 'technical' && (
            <div>
              {/* Site Inspection Requests */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <h3>Site Inspections</h3>
                  {hasPermission('mod_ps_inspection_req', 'request_inspection') && (
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/inspection-requests/new', { state: { lead } })}>
                      <Plus size={14} /> Add Request
                    </button>
                  )}
                </div>
                {inspections.length === 0 ? (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                    No site inspection requests created for this lead yet.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Visit Date</th>
                          <th>Engineer</th>
                          <th>Purpose</th>
                          <th>Priority</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspections.map(i => (
                          <tr key={i.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/presales/inspection-requests/${i.id}`)}>
                            <td>{new Date(i.preferredVisitDate).toLocaleDateString()}</td>
                            <td>{i.assignedEngineerName || 'Not Assigned'}</td>
                            <td>{i.inspectionPurpose}</td>
                            <td>{i.priority}</td>
                            <td><span className="badge badge-scheduled">{i.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Engineering Feasibility Surveys */}
              <div style={{ marginBottom: '32px' }}>
                <h3>Engineering Site Survey Reports</h3>
                {surveys.length === 0 ? (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                    No engineering feasibility surveys completed yet.
                  </div>
                ) : (
                  surveys.map(s => (
                    <div key={s.id} className="card" style={{ background: '#F8FAFC', border: '1px solid var(--color-border)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong>Feasibility Status: <span style={{ color: s.feasibilityStatus === 'Feasible' ? '#10B981' : '#F59E0B' }}>{s.feasibilityStatus}</span></strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Visited on: {new Date(s.visitDate).toLocaleDateString()} by {s.engineerName}</span>
                      </div>
                      <div className="grid-cols-3" style={{ gap: '16px', fontSize: '13px', marginBottom: '12px' }}>
                        <div><strong>Roof Type:</strong> {s.roofType}</div>
                        <div><strong>Roof Size:</strong> {s.roofSizeInSqFt} SqFt</div>
                        <div><strong>Elec Load:</strong> {s.electricalLoad} kW</div>
                        <div><strong>Transformer:</strong> {s.transformerAvailable ? 'Yes' : 'No'}</div>
                        <div><strong>Grid Available:</strong> {s.gridAvailable ? 'Yes' : 'No'}</div>
                        <div><strong>GPS Coordinates:</strong> {s.gpsLatitude ? `${s.gpsLatitude}, ${s.gpsLongitude}` : 'N/A'}</div>
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        <div><strong>Shadow Issues:</strong> {s.shadowIssues || 'None'}</div>
                        <div><strong>Engineering Remarks:</strong> {s.engineeringRemarks}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Array Layouts */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <h3>Solar Array Layout Designs</h3>
                  {hasPermission('mod_ps_array', 'create') && (
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/array-layouts/new', { state: { lead } })}>
                      <Plus size={14} /> Create Design
                    </button>
                  )}
                </div>
                {layouts.length === 0 ? (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                    No system layout designs created yet.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Plant Capacity</th>
                          <th>Panel Type</th>
                          <th>Panel Count</th>
                          <th>Orientation</th>
                          <th>Tilt Angle</th>
                          <th>Drawing</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {layouts.map(l => (
                          <tr key={l.id}>
                            <td>{l.plantCapacity} kWp</td>
                            <td>{l.panelType}</td>
                            <td>{l.panelCount}</td>
                            <td>{l.orientation}</td>
                            <td>{l.tiltAngle}°</td>
                            <td>
                              {l.layoutDrawingUpload ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', cursor: 'pointer' }}>
                                  <Download size={13} /> {l.layoutDrawingUpload}
                                </span>
                              ) : '-'}
                            </td>
                            <td><span className="badge badge-completed">{l.designStatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sizing Reports */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <h3>System Sizing Estimates</h3>
                  {hasPermission('mod_ps_sizing', 'create') && (
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/sizing-reports/new', { state: { lead } })}>
                      <Plus size={14} /> New Report
                    </button>
                  )}
                </div>
                {sizing.length === 0 ? (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                    No system sizing calculations generated.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Req Capacity</th>
                          <th>Rec Capacity</th>
                          <th>Annual Est Generation</th>
                          <th>Perf Ratio</th>
                          <th>Module Wattage</th>
                          <th>Inverter Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizing.map(s => (
                          <tr key={s.id}>
                            <td>{s.requiredCapacity} kWp</td>
                            <td>{s.recommendedCapacity} kWp</td>
                            <td>{s.annualGenerationEstimate.toLocaleString()} kWh</td>
                            <td>{s.performanceRatio}%</td>
                            <td>{s.moduleWattage} Wp</td>
                            <td>{s.inverterCapacity} kW</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMMERCIAL TAB */}
          {activeTab === 'commercial' && (
            <div>
              {/* BOM Management */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <h3>Bill of Materials (BOM)</h3>
                  {hasPermission('mod_ps_bom', 'create') && (
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/bom/new', { state: { lead } })}>
                      <Plus size={14} /> Build BOM
                    </button>
                  )}
                </div>
                {boms.length === 0 ? (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                    No BOM created for this project.
                  </div>
                ) : (
                  boms.map(b => (
                    <div key={b.id} className="card" style={{ marginBottom: '16px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <strong>BOM Amount: <span style={{ color: '#2563EB', fontSize: '16px' }}>₹{(b.totalAmount || 0).toLocaleString()}</span></strong>
                        <span className="badge badge-completed">{b.bomStatus}</span>
                      </div>
                      <div className="table-wrapper">
                        <table className="table" style={{ fontSize: '12px' }}>
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Component Name</th>
                              <th>Qty</th>
                              <th>Unit Price</th>
                              <th>Total</th>
                              <th>Vendor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {b.lineItems.map((item: any) => (
                              <tr key={item.id}>
                                <td>{item.itemCategory}</td>
                                <td><strong>{item.itemName}</strong><div style={{ fontSize: '10px', color: '#94A3B8' }}>{item.specification}</div></td>
                                <td>{item.quantity} {item.uom}</td>
                                <td>₹{(item.unitPrice || 0).toLocaleString()}</td>
                                <td>₹{(item.totalPrice || 0).toLocaleString()}</td>
                                <td>{item.vendorName || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cost Estimations */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <h3>Commercial Pricing & Margins</h3>
                  {hasPermission('mod_ps_costing', 'create') && costs.length === 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/costing/new', { state: { lead } })}>
                      <Plus size={14} /> Add Cost Estimate
                    </button>
                  )}
                </div>
                {costs.length === 0 ? (
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                    No cost estimation or taxation calculations done yet.
                  </div>
                ) : (
                  costs.map(c => (
                    <div key={c.id} className="grid-cols-2" style={{ gap: '20px' }}>
                      <div className="card" style={{ background: '#F8FAFC' }}>
                        <h4 style={{ marginBottom: '12px' }}>Cost Breakdown</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Material Base:</span><span>₹{c.materialCost.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Labour:</span><span>₹{c.labourCost.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Transport:</span><span>₹{c.transportationCost.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Civil works:</span><span>₹{c.civilCost.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Installation:</span><span>₹{c.installationCost.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Overheads:</span><span>₹{c.overheadCost.toLocaleString()}</span>
                        </div>
                        <hr style={{ margin: '8px 0', borderColor: 'var(--color-border)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '14px' }}>
                          <span>Subtotal Cost:</span><span>₹{c.subTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="card" style={{ background: '#FFFDF5', border: '1px solid #FEF3C7' }}>
                        <h4 style={{ marginBottom: '12px' }}>Final Project Pricing</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Gross Cost:</span><span>₹{c.subTotal.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Margin: ({c.marginPercentage}%)</span><span>₹{c.marginAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>Price Excl. Tax:</span><span>₹{c.totalBeforeTax.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>GST / Tax: ({c.taxPercentage}%)</span><span>₹{c.taxAmount.toLocaleString()}</span>
                        </div>
                        <hr style={{ margin: '8px 0', borderColor: 'var(--color-border)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: '#10B981' }}>
                          <span>Final Offer Price:</span><span>₹{(c.finalProjectCost || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PROPOSAL TAB */}
          {activeTab === 'proposal' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <h3>Technical Commercial Offers (TCO)</h3>
                {hasPermission('mod_ps_proposals', 'create') && (
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/proposals/new', { state: { lead } })}>
                    <Plus size={14} /> Draft TCO Proposal
                  </button>
                )}
              </div>
              {proposals.length === 0 ? (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                  No technical commercial proposal has been compiled yet.
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Proposal Number</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Version</th>
                        <th>Expiry Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposals.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.proposalNumber}</strong></td>
                          <td>{p.projectCapacity} kWp</td>
                          <td><span className="badge badge-completed">{p.proposalStatus}</span></td>
                          <td>v{p.version}</td>
                          <td>{p.validityDate ? new Date(p.validityDate).toLocaleDateString() : '-'}</td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/presales/proposals/${p.id}`)}>
                                View & Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
