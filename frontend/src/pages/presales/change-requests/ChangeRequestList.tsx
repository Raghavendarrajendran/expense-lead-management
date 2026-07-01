import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChangeRequests, updateChangeRequest } from '../../../api/presales.api';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Check, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChangeRequestList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [crs, setCrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCRs = () => {
    setLoading(true);
    getChangeRequests()
      .then(res => setCrs(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCRs();
  }, []);

  const handleReview = async (id: string, status: 'Approved' | 'Rejected') => {
    const comments = window.prompt(`Enter review comments for marking this change request as ${status}:`);
    if (comments === null) return;

    try {
      await updateChangeRequest(id, { approvalStatus: status, comments });
      toast.success(`Change request ${status.toLowerCase()}`);
      fetchCRs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Change Requests</h1>
          <p className="page-subtitle">Track specification, solar capacity, or commercial scope modifications mid-pipeline.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate('/presales/change-requests/new')}>
            <Plus size={16} /> Raise Change Request
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : crs.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B' }}>
          No specification change requests logged.
        </div>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Type</th>
                <th>Old Value</th>
                <th>Requested Value</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {crs.map(cr => (
                <tr key={cr.id}>
                  <td><strong>{cr.customerName}</strong><div style={{ fontSize: '11px', color: '#64748B' }}>By: {cr.requestedByName}</div></td>
                  <td>{cr.changeType}</td>
                  <td>{cr.oldValue}</td>
                  <td><strong style={{ color: '#2563EB' }}>{cr.requestedValue}</strong></td>
                  <td><p style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }} title={cr.reason}>{cr.reason}</p></td>
                  <td><span className="badge badge-scheduled">{cr.approvalStatus}</span></td>
                  <td><span style={{ fontSize: '12px', color: '#64748B' }}>{cr.comments || '-'}</span></td>
                  <td>
                    {hasPermission('mod_ps_change_requests', 'approve') && cr.approvalStatus === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-success btn-xs" title="Approve" onClick={() => handleReview(cr.id, 'Approved')}>
                          <Check size={13} />
                        </button>
                        <button className="btn btn-danger btn-xs" title="Reject" onClick={() => handleReview(cr.id, 'Rejected')}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
