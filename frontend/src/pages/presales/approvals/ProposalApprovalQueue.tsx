import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProposalApprovals, approveProposalStep, rejectProposalStep } from '../../../api/presales.api';
import { useAuth } from '../../../contexts/AuthContext';
import { ThumbsUp, ThumbsDown, MessageSquare, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProposalApprovalQueue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal
  const [activeStep, setActiveStep] = useState<any>(null);
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState<'Approve' | 'Reject' | 'Revision'>('Approve');

  const fetchApprovalsQueue = () => {
    setLoading(true);
    getProposalApprovals({ status: 'Pending' })
      .then(res => setApprovals(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApprovalsQueue();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments && decision !== 'Approve') {
      toast.error('Remarks/reasons are required for rejection or revision requests');
      return;
    }

    try {
      if (decision === 'Approve') {
        await approveProposalStep(activeStep.id, { comments });
        toast.success('Proposal approved successfully');
      } else {
        await rejectProposalStep(activeStep.id, {
          comments,
          requireRevision: decision === 'Revision',
        });
        toast.success(decision === 'Revision' ? 'Revision request submitted' : 'Proposal rejected');
      }
      setActiveStep(null);
      setComments('');
      fetchApprovalsQueue();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit decision');
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Proposal Approvals Queue</h1>
          <p className="page-subtitle">Review, approve, or reject Technical Commercial Offers before customer handover.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : approvals.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B' }}>
          No proposals pending your approval at this stage.
        </div>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer / Lead</th>
                <th>Required Approver Role</th>
                <th>Action Stage</th>
                <th>Requested Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map(step => (
                <tr key={step.id}>
                  <td>
                    <strong>Proposal ID: {step.proposalId}</strong>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Stage: {step.stage}</div>
                  </td>
                  <td>{step.approverRole.toUpperCase().replace('_', ' ')}</td>
                  <td>{step.stage}</td>
                  <td>{new Date(step.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/presales/proposals/${step.proposalId}`)}>
                        <Eye size={13} style={{ marginRight: '4px' }} /> View Proposal
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => { setActiveStep(step); setDecision('Approve'); }}>
                        Take Decision
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Decision Modal */}
      {activeStep && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Submit Approval Decision</h3>
              <button className="btn-close" onClick={() => setActiveStep(null)}>&times;</button>
            </div>
            <form onSubmit={handleDecisionSubmit}>
              <div className="form-group">
                <label>Decision</label>
                <select value={decision} onChange={e => setDecision(e.target.value as any)}>
                  <option value="Approve">Approve Proposal</option>
                  <option value="Revision">Request Revision / Changes</option>
                  <option value="Reject">Reject Proposal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Remarks / Revision Instructions *</label>
                <textarea
                  rows={4}
                  required={decision !== 'Approve'}
                  placeholder="Enter your decision comments or revision specifications..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveStep(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
