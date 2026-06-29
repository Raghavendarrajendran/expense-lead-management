import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSiteVisits } from '../../api/siteVisits.api';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Eye, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';

export const SiteVisitList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetchVisits = () => {
    setLoading(true);
    getSiteVisits({ status })
      .then(res => setVisits(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits();
  }, [status]);

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'Scheduled': return 'badge-scheduled';
      case 'In Progress': return 'badge-contacted';
      case 'Completed': return 'badge-completed';
      case 'Cancelled': return 'badge-lost';
      default: return 'badge-draft';
    }
  };

  return (
    <div className="site-visit-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Site Surveys</h1>
          <p className="page-subtitle">Manage solar feasibility assessments and visits.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="filter-row">
            <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '48px 0' }}>
            <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Assigned Executive</th>
                <th>Visit Date & Time</th>
                <th>Site Address</th>
                <th>Feasibility Status</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">No site visits scheduled.</td>
                </tr>
              ) : (
                visits.map(visit => (
                  <tr key={visit.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{visit.customerName}</span>
                      <div className="text-muted" style={{ fontSize: '11px' }}>ID: {visit.leadId}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{visit.assignedExecutiveName}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                        <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                        {visit.visitDate} | {visit.visitTime}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="truncate" style={{ maxWidth: '240px' }}>{visit.siteAddress}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: visit.feasibilityStatus === 'Feasible' ? 'var(--color-success)' :
                               visit.feasibilityStatus === 'Not Feasible' ? 'var(--color-danger)' :
                               'var(--color-text-secondary)'
                      }}>
                        {visit.feasibilityStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(visit.status)}`}>{visit.status}</span>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => navigate(`/site-visits/${visit.id}`)} title="View Detail">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
