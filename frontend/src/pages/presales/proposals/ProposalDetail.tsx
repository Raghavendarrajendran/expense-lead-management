import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProposal, submitProposalForApproval, sendProposalToCustomer, getProposalApprovalsByProposal } from '../../../api/presales.api';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Send, CheckCircle2, Clock, Printer, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProposalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [proposal, setProposal] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposalData = async () => {
    setLoading(true);
    try {
      const propRes = await getProposal(id!);
      setProposal(propRes.data.data);

      const appRes = await getProposalApprovalsByProposal(id!);
      setApprovals(appRes.data.data);
    } catch (err: any) {
      toast.error('Failed to load proposal details');
      navigate('/presales/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposalData();
  }, [id]);

  const handleSubmitForApproval = async () => {
    try {
      await submitProposalForApproval(proposal.id);
      toast.success('Proposal submitted for internal review');
      fetchProposalData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    }
  };

  const handleSendToCustomer = async () => {
    try {
      await sendProposalToCustomer(proposal.id);
      toast.success('Proposal marked as sent to customer');
      fetchProposalData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update proposal status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !proposal) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="proposal-detail-page animate-fade">
      {/* Hide controls on Print */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={15} style={{ marginRight: '6px' }} /> Print Proposal
          </button>
          {hasPermission('mod_ps_proposals', 'submit') && proposal.proposalStatus === 'Draft' && (
            <button className="btn btn-primary" onClick={handleSubmitForApproval}>
              Submit for Internal Approval
            </button>
          )}
          {hasPermission('mod_ps_proposals', 'send') && proposal.proposalStatus === 'Approved' && (
            <button className="btn btn-primary" onClick={handleSendToCustomer}>
              <Send size={15} style={{ marginRight: '6px' }} /> Mark as Sent to Customer
            </button>
          )}
          {proposal.proposalStatus === 'Sent To Customer' && (
            <button className="btn btn-success" onClick={() => navigate('/presales/orders/new', { state: { proposal } })}>
              Finalize Order (PO Received)
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '24px' }}>
        {/* Printable Proposal Document */}
        <div className="card print-document" style={{ padding: '40px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#000' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563EB', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ color: '#2563EB', margin: 0, fontSize: '24px', fontWeight: 800 }}>ZSmart Energy Solutions</h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Commercial Rooftop Solar Experts</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>TECHNICAL COMMERCIAL OFFER</h3>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>No: {proposal.proposalNumber}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Date: {new Date(proposal.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Client Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontWeight: 600 }}>PREPARED FOR:</span>
              <strong>{proposal.customerName}</strong>
              <div>Lead Reference ID: {proposal.leadId}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#64748B', display: 'block', fontWeight: 600 }}>PROPOSAL VALIDITY:</span>
              <div>Valid Until: <strong>{proposal.validityDate ? new Date(proposal.validityDate).toLocaleDateString() : 'N/A'}</strong></div>
              <div>Prepared By: {proposal.createdByName}</div>
            </div>
          </div>

          {/* Proposal Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '13px', lineHeight: '1.6' }}>
            <div>
              <h4 style={{ color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px' }}>1. Scope of Work</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{proposal.scopeOfWork}</p>
            </div>

            <div>
              <h4 style={{ color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px' }}>2. Technical Specifications & Power Yield Estimates</h4>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '4px', whiteSpace: 'pre-line', borderLeft: '3px solid #2563EB' }}>
                {proposal.technicalDetails}
              </div>
            </div>

            <div>
              <h4 style={{ color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px' }}>3. Commercial Quotation</h4>
              <div style={{ whiteSpace: 'pre-line', fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
                {proposal.commercialDetails}
              </div>
            </div>

            <div>
              <h4 style={{ color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px' }}>4. Milestones & Payment Terms</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{proposal.paymentTerms}</p>
            </div>

            <div>
              <h4 style={{ color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px' }}>5. Warranties & Guarantees</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{proposal.warrantyDetails}</p>
            </div>

            <div>
              <h4 style={{ color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px' }}>6. Standard Terms & Conditions</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{proposal.termsAndConditions}</p>
            </div>

            <div>
              <h4 style={{ color: '#2563EB', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px' }}>7. Exclusions</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{proposal.exclusions}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Workflow Status */}
        <div className="no-print">
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>Proposal Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
              <span className="badge badge-scheduled" style={{ fontSize: '13px' }}>
                {proposal.proposalStatus}
              </span>
              <span style={{ color: '#64748B' }}>Version v{proposal.version}</span>
            </div>
            {proposal.proposalStatus === 'Revision Required' && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px', borderRadius: '6px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Revision Needed:</strong> Review approvals timeline comments below for guidance.
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Approval Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {approvals.map((step, idx) => (
                <div key={step.id} style={{ display: 'flex', gap: '12px', borderLeft: idx < approvals.length - 1 ? '1.5px solid #E2E8F0' : 'none', paddingBottom: '12px', paddingLeft: '12px', position: 'relative' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: step.status === 'Approved' ? '#10B981' : step.status === 'Pending' ? '#3B82F6' : '#EF4444',
                    position: 'absolute', left: '-5px', top: '5px'
                  }} />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>{step.stage}</strong>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Status: <span style={{ fontWeight: 600, color: step.status === 'Approved' ? '#10B981' : 'inherit' }}>{step.status}</span>
                    </div>
                    {step.approverName && <div style={{ fontSize: '11px', color: '#94A3B8' }}>By: {step.approverName}</div>}
                    {step.comments && <p style={{ fontSize: '11px', color: '#94A3B8', background: '#F8FAFC', padding: '6px', borderRadius: '4px', marginTop: '4px' }}>"{step.comments}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
