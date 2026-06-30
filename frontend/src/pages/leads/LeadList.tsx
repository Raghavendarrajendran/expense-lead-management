import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, deleteLead, assignLead, changeLeadStatus } from '../../api/leads.api';
import { getUsers } from '../../api/users.api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Eye, Edit2, Trash2, UserPlus, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeadList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');

  // Assign Modal
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedExecId, setSelectedExecId] = useState('');

  const fetchLeadsList = () => {
    setLoading(true);
    getLeads({ search, status, source })
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeadsList();
  }, [search, status, source]);

  useEffect(() => {
    if (hasPermission('mod_leads', 'assign')) {
      getUsers({ roleId: 'role_field_executive' })
        .then(res => setExecutives(res.data.data))
        .catch(err => console.error(err));
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(id);
      toast.success('Lead deleted successfully');
      fetchLeadsList();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExecId) return;
    const exec = executives.find(u => u.id === selectedExecId);
    try {
      await assignLead(selectedLead.id, {
        executiveId: selectedExecId,
        executiveName: exec ? exec.name : 'Unknown',
      });
      toast.success('Lead assigned successfully');
      setSelectedLead(null);
      setSelectedExecId('');
      fetchLeadsList();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign lead');
    }
  };

  const getStatusClass = (st: string) => {
    switch (st) {
      case 'New': return 'badge-new';
      case 'Assigned': return 'badge-assigned';
      case 'Contacted': return 'badge-contacted';
      case 'Field Visit Scheduled': return 'badge-scheduled';
      case 'Field Visit Completed': return 'badge-completed';
      case 'Quotation Shared': return 'badge-scheduled';
      case 'Negotiation': return 'badge-contacted';
      case 'Converted': return 'badge-converted';
      case 'Lost': return 'badge-lost';
      default: return 'badge-draft';
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Lead Management</h1>
          <p className="page-subtitle">Track, assign, and convert business prospects.</p>
        </div>
        {hasPermission('mod_leads', 'create') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/leads/new')}>
              <Plus size={16} /> Create Lead
            </button>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, mobile, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
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

            <select className="filter-select" value={source} onChange={e => setSource(e.target.value)}>
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="Reference">Reference</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Social Media">Social Media</option>
            </select>

            {(status || source || search) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setStatus(''); setSource(''); setSearch(''); }}>
                Clear Filters <X size={14} style={{ marginLeft: '4px' }} />
              </button>
            )}
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
                <th>Customer Details</th>
                <th>Requirement</th>
                <th>Project Budget</th>
                <th>Assigned Exec</th>
                <th>Status</th>
                <th>Follow Up Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">No leads found matching criteria.</td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{lead.customerName}</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>{lead.mobile} | {lead.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{lead.requirementType}</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>{lead.customerType} | {lead.city}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{lead.projectBudget}</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>Scale: {lead.projectScale}</div>
                    </td>
                    <td>
                      {lead.assignedExecutiveName ? (
                        <span style={{ fontWeight: 500 }}>{lead.assignedExecutiveName}</span>
                      ) : (
                        <span className="text-muted" style={{ fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(lead.status)}`}>{lead.status}</span>
                    </td>
                    <td>
                      {lead.followUpDate ? (
                        <span style={{ fontWeight: 500 }}>{lead.followUpDate}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => navigate(`/leads/${lead.id}`)} title="View Detail">
                          <Eye size={14} />
                        </button>
                        {hasPermission('mod_leads', 'edit') && (
                          <button className="btn btn-secondary btn-icon" onClick={() => navigate(`/leads/${lead.id}/edit`)} title="Edit Lead">
                            <Edit2 size={14} />
                          </button>
                        )}
                        {hasPermission('mod_leads', 'assign') && (
                          <button className="btn btn-navy btn-icon" onClick={() => setSelectedLead(lead)} title="Assign Lead">
                            <UserPlus size={14} />
                          </button>
                        )}
                        {hasPermission('mod_leads', 'delete') && (
                          <button className="btn btn-danger btn-icon" onClick={() => handleDelete(lead.id)} title="Delete Lead">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Modal */}
      {selectedLead && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Assign Lead: {selectedLead.customerName}</h2>
              <button className="btn-icon" onClick={() => setSelectedLead(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Field Executive</label>
                  <select
                    className="form-select"
                    value={selectedExecId}
                    onChange={e => setSelectedExecId(e.target.value)}
                    required
                  >
                    <option value="">Select executive...</option>
                    {executives.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedLead(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!selectedExecId}>Assign Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
