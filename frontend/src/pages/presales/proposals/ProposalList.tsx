import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProposals } from '../../../api/presales.api';
import { Plus, FileCheck, Eye, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const ProposalList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    getProposals()
      .then(res => setProposals(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'badge-draft';
      case 'Pending Approval':
        return 'badge-pending';
      case 'Approved':
        return 'badge-approved';
      case 'Rejected':
        return 'badge-rejected';
      case 'Sent To Customer':
        return 'badge-assigned';
      case 'Accepted':
        return 'badge-completed';
      case 'Lost':
        return 'badge-lost';
      default:
        return 'badge-draft';
    }
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      p.createdByName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !status || p.proposalStatus === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Proposal Offers (TCO)</h1>
          <p className="page-subtitle">Track and draft customer TCO quotes, warranties, commercial terms, and approval workflows.</p>
        </div>
        {hasPermission('mod_ps_proposals', 'create') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/presales/proposals/new')}>
              <Plus size={16} /> Draft TCO Proposal
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : (
        <div className="card table-wrapper">
          <div className="table-toolbar">
            <div className="table-search">
              <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by customer or drafter..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Sent To Customer">Sent To Customer</option>
                <option value="Accepted">Accepted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B', border: 'none' }}>
              No proposals matching your filters.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Capacity (kWp)</th>
                  <th>Validity Date</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.customerName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <FileCheck size={14} style={{ color: '#10B981' }} />
                        {p.projectCapacity} kWp
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Calendar size={13} style={{ color: '#64748B' }} />
                        {new Date(p.validityDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td><span className={`badge ${getStatusBadgeClass(p.proposalStatus)}`}>{p.proposalStatus}</span></td>
                    <td>{p.createdByName}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon" title="View Proposal details" onClick={() => navigate(`/presales/proposals/${p.id}`)}>
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
