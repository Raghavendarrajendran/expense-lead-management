import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSiteInspections, deleteSiteInspection } from '../../../api/presales.api';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Search, Eye, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const InspectionList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const fetchInspections = () => {
    setLoading(true);
    getSiteInspections({ status, priority })
      .then(res => setInspections(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInspections();
  }, [status, priority]);

  const filteredInspections = inspections.filter(ins =>
    ins.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    ins.siteAddress?.toLowerCase().includes(search.toLowerCase()) ||
    (ins.assignedEngineerName && ins.assignedEngineerName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inspection request?')) return;
    try {
      await deleteSiteInspection(id);
      toast.success('Inspection request deleted');
      fetchInspections();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete request');
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Site Inspections</h1>
          <p className="page-subtitle">Track and assign site audits to solar design engineers.</p>
        </div>
        {hasPermission('mod_ps_inspection_req', 'request_inspection') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/presales/inspection-requests/new')}>
              <Plus size={16} /> Request Site Inspection
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
                placeholder="Search by customer, engineer, address..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Requested">Requested</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rework Required">Rework Required</option>
              </select>
              <select className="filter-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          {filteredInspections.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B', border: 'none' }}>
              No site inspections registered matching your search.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Engineer Assigned</th>
                  <th>Preferred Visit Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInspections.map(ins => (
                  <tr key={ins.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ins.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <MapPin size={11} /> {ins.siteAddress}
                      </div>
                    </td>
                    <td>{ins.assignedEngineerName || <span style={{ color: '#94A3B8', fontSize: '12px' }}>Unassigned</span>}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Calendar size={13} style={{ color: '#64748B' }} />
                        {new Date(ins.preferredVisitDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{ins.priority}</td>
                    <td><span className={`badge ${ins.status === 'Completed' ? 'badge-completed' : ins.status === 'Requested' ? 'badge-new' : ins.status === 'Assigned' ? 'badge-assigned' : 'badge-pending'}`}>{ins.status}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon" title="View Detail" onClick={() => navigate(`/presales/inspection-requests/${ins.id}`)}>
                          <Eye size={16} />
                        </button>
                        {hasPermission('mod_ps_inspection_req', 'change_status') && (
                          <button className="btn-icon" title="Edit / Update Status" onClick={() => navigate(`/presales/inspection-requests/${ins.id}/edit`)}>
                            <Edit2 size={16} />
                          </button>
                        )}
                        {hasPermission('mod_ps_inspection_req', 'delete') && (
                          <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(ins.id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
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
