import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerFollowups } from '../../../api/presales.api';
import { Plus, Calendar, Phone, Mail, Users, MessageSquare } from 'lucide-react';

export const FollowupList = () => {
  const navigate = useNavigate();
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowups = () => {
    setLoading(true);
    getCustomerFollowups()
      .then(res => setFollowups(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Call': return <Phone size={14} />;
      case 'Email': return <Mail size={14} />;
      case 'Meeting': return <Users size={14} />;
      default: return <MessageSquare size={14} />;
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Customer Follow-ups</h1>
          <p className="page-subtitle">Track proposal reviews, customer feedback, and negotiations logging.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate('/presales/followups/new')}>
            <Plus size={16} /> Log Follow-up
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '35vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : followups.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B' }}>
          No follow-ups logged yet.
        </div>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer / Lead</th>
                <th>Follow-up Date</th>
                <th>Mode</th>
                <th>Discussion Summary</th>
                <th>Customer Feedback</th>
                <th>Next Action Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {followups.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.customerName}</strong><div style={{ fontSize: '11px', color: '#64748B' }}>Proposal: {f.proposalId || 'N/A'}</div></td>
                  <td>{new Date(f.followUpDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      {getModeIcon(f.communicationMode)} {f.communicationMode}
                    </span>
                  </td>
                  <td><p style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>{f.discussionSummary}</p></td>
                  <td><p style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>{f.customerFeedback || '-'}</p></td>
                  <td>{f.nextFollowUpDate ? new Date(f.nextFollowUpDate).toLocaleDateString() : '-'}</td>
                  <td><span className="badge badge-scheduled">{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
