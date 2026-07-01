import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPresalesLeads, deletePresalesLead, assignLead, qualifyLead } from '../../../api/presales.api';
import { getUsers } from '../../../api/users.api';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Search, Eye, Edit2, Trash2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeadQualList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [salesExecs, setSalesExecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');

  // Assign Modal
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedExecId, setSelectedExecId] = useState('');

  // Qualify Modal
  const [qualifyLeadItem, setQualifyLeadItem] = useState<any>(null);
  const [qualifyStatus, setQualifyStatus] = useState('Qualified');
  const [qualifyRemarks, setQualifyRemarks] = useState('');
  const [probability, setProbability] = useState(70);
  const [expectedCloseDate, setExpectedCloseDate] = useState('');

  const fetchLeads = () => {
    setLoading(true);
    getPresalesLeads({ search, status, customerType })
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [search, status, customerType]);

  useEffect(() => {
    if (hasPermission('mod_ps_leads', 'assign')) {
      getUsers({ roleId: 'role_sales_executive' })
        .then(res => setSalesExecs(res.data.data))
        .catch(err => console.error(err));
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pre-sales lead?')) return;
    try {
      await deletePresalesLead(id);
      toast.success('Pre-sales lead deleted successfully');
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExecId) return;
    const exec = salesExecs.find(u => u.id === selectedExecId);
    try {
      await assignLead(selectedLead.id, {
        salesExecId: selectedExecId,
        salesExecName: exec ? exec.name : 'Unknown',
      });
      toast.success('Sales Executive assigned successfully');
      setSelectedLead(null);
      setSelectedExecId('');
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign lead');
    }
  };

  const handleQualifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await qualifyLead(qualifyLeadItem.id, {
        status: qualifyStatus,
        remarks: qualifyRemarks,
        probability,
        expectedCloseDate,
      });
      toast.success(`Lead ${qualifyStatus.toLowerCase()} successfully`);
      setQualifyLeadItem(null);
      setQualifyRemarks('');
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update qualification status');
    }
  };

  const getStatusClass = (st: string) => {
    switch (st) {
      case 'New': return 'badge-new';
      case 'Qualified': return 'badge-completed';
      case 'Disqualified': return 'badge-lost';
      case 'Site Inspection Required': return 'badge-scheduled';
      default: return 'badge-draft';
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Pre-Sales Lead Qualification</h1>
          <p className="page-subtitle">Qualify prospects and enrich leads with solar energy metrics.</p>
        </div>
        {hasPermission('mod_ps_leads', 'create') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/presales/leads/new')}>
              <Plus size={16} /> Add Pre-Sales Lead
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : leads.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B' }}>
          No pre-sales leads found. Click "Add Pre-Sales Lead" to create one.
        </div>
      ) : (
        <div className="card table-wrapper">
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
                <option value="Qualified">Qualified</option>
                <option value="Disqualified">Disqualified</option>
                <option value="Site Inspection Required">Site Inspection Required</option>
              </select>
              <select className="filter-select" value={customerType} onChange={e => setCustomerType(e.target.value)}>
                <option value="">All Customer Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Agricultural">Agricultural</option>
              </select>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Budget (₹)</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Expected Close</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.customerName}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{lead.city}, {lead.state}</div>
                  </td>
                  <td>
                    <div>{lead.mobile}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{lead.email}</div>
                  </td>
                  <td>{lead.customerType}</td>
                  <td>₹{(lead.budget || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${getStatusClass(lead.qualificationStatus)}`}>
                      {lead.qualificationStatus}
                    </span>
                  </td>
                  <td>{lead.assignedSalesExecName || <span style={{ color: '#94A3B8', fontSize: '12px' }}>Unassigned</span>}</td>
                  <td>{lead.expectedCloseDate ? new Date(lead.expectedCloseDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="View details" onClick={() => navigate(`/presales/leads/${lead.id}`)}>
                        <Eye size={16} />
                      </button>
                      {hasPermission('mod_ps_leads', 'edit') && (
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/presales/leads/${lead.id}/edit`)}>
                          <Edit2 size={16} />
                        </button>
                      )}
                      {hasPermission('mod_ps_leads', 'assign') && (
                        <button className="btn-icon text-primary" title="Assign Executive" onClick={() => { setSelectedLead(lead); setSelectedExecId(lead.assignedSalesExecId || ''); }}>
                          <UserPlus size={16} />
                        </button>
                      )}
                      {hasPermission('mod_ps_leads', 'qualify') && lead.qualificationStatus === 'New' && (
                        <button className="btn-icon text-success" title="Qualify/Disqualify" onClick={() => { setQualifyLeadItem(lead); setQualifyStatus('Qualified'); }}>
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {hasPermission('mod_ps_leads', 'delete') && (
                        <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(lead.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Assign Sales Executive</h3>
              <button className="btn-close" onClick={() => setSelectedLead(null)}>&times;</button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label>Lead</label>
                <input type="text" readOnly value={selectedLead.customerName} />
              </div>
              <div className="form-group">
                <label>Sales Executive</label>
                <select
                  required
                  value={selectedExecId}
                  onChange={e => setSelectedExecId(e.target.value)}
                >
                  <option value="">Select Executive</option>
                  {salesExecs.map(exec => (
                    <option key={exec.id} value={exec.id}>{exec.name} ({exec.designation || 'Sales'})</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedLead(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Qualify Modal */}
      {qualifyLeadItem && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Qualify / Disqualify Lead</h3>
              <button className="btn-close" onClick={() => setQualifyLeadItem(null)}>&times;</button>
            </div>
            <form onSubmit={handleQualifySubmit}>
              <div className="form-group">
                <label>Status</label>
                <select value={qualifyStatus} onChange={e => setQualifyStatus(e.target.value)}>
                  <option value="Qualified">Qualified</option>
                  <option value="Disqualified">Disqualified</option>
                  <option value="Site Inspection Required">Site Inspection Required</option>
                </select>
              </div>
              {qualifyStatus !== 'Disqualified' && (
                <>
                  <div className="form-group">
                    <label>Win Probability (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={probability}
                      onChange={e => setProbability(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Expected Close Date</label>
                    <input
                      type="date"
                      value={expectedCloseDate}
                      onChange={e => setExpectedCloseDate(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Remarks / Decision Reasons</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter evaluation remarks..."
                  value={qualifyRemarks}
                  onChange={e => setQualifyRemarks(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setQualifyLeadItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
