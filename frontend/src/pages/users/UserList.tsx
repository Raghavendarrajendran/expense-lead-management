import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUser, deleteUser, mapHierarchy } from '../../api/users.api';
import { getRoles } from '../../api/roles.api';
import { Plus, Search, Edit2, Trash2, Shield, GitMerge, Power, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('');

  // Map Hierarchy Modal
  const [mappingUser, setMappingUser] = useState<any>(null);
  const [managerId, setManagerId] = useState('');
  const [teamLeadId, setTeamLeadId] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ roleId })
      .then(res => {
        let list = res.data.data;
        if (search) {
          const s = search.toLowerCase();
          list = list.filter((u: any) =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.phone.includes(s),
          );
        }
        setUsers(list);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleId]);

  useEffect(() => {
    getRoles()
      .then(res => setRoles(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleToggleActive = async (user: any) => {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to change user status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to delete user');
    }
  };

  const handleMapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingUser) return;
    try {
      await mapHierarchy({
        userId: mappingUser.id,
        managerId: managerId || undefined,
        teamLeadId: teamLeadId || undefined,
      });
      toast.success('User hierarchy mapped successfully');
      setMappingUser(null);
      setManagerId('');
      setTeamLeadId('');
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to map user hierarchy');
    }
  };

  const openMappingModal = (user: any) => {
    setMappingUser(user);
    setManagerId(user.managerId || '');
    setTeamLeadId(user.teamLeadId || '');
  };

  return (
    <div className="user-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Configure application accounts, roles, and hierarchy mappings.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate('/users/new')}>
            <Plus size={16} /> Create User
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <select className="filter-select" value={roleId} onChange={e => setRoleId(e.target.value)}>
              <option value="">All Roles</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.displayName}</option>
              ))}
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
                <th>Name / Email</th>
                <th>Designation / Phone</th>
                <th>Role</th>
                <th>Manager / Team Lead</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div className="text-muted" style={{ fontSize: '12px' }}>{u.email}</div>
                  </td>
                  <td>
                    <div>{u.designation || '—'}</div>
                    <div className="text-muted" style={{ fontSize: '12px' }}>{u.phone || '—'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{u.roleName.toUpperCase()}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      {u.managerId && <div><strong>Manager:</strong> {users.find(x => x.id === u.managerId)?.name || u.managerId}</div>}
                      {u.teamLeadId && <div><strong>Team Lead:</strong> {users.find(x => x.id === u.teamLeadId)?.name || u.teamLeadId}</div>}
                      {!u.managerId && !u.teamLeadId && <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-icon" onClick={() => navigate(`/users/${u.id}/edit`)} title="Edit User">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-secondary btn-icon" onClick={() => openMappingModal(u)} title="Map Hierarchy">
                        <GitMerge size={14} />
                      </button>
                      <button className={`btn btn-icon ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        <Power size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDelete(u.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Map Hierarchy Modal */}
      {mappingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Map Reporting Hierarchy: {mappingUser.name}</h2>
              <button className="btn-icon" onClick={() => setMappingUser(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleMapSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '16px', fontSize: '13.5px' }}>
                  Assign a Manager or Team Lead under whom <strong>{mappingUser.name}</strong> will report.
                </p>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Manager</label>
                  <select className="form-select" value={managerId} onChange={e => setManagerId(e.target.value)}>
                    <option value="">Select Manager (None)</option>
                    {users.filter(x => x.roleName === 'manager' && x.id !== mappingUser.id).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Team Lead</label>
                  <select className="form-select" value={teamLeadId} onChange={e => setTeamLeadId(e.target.value)}>
                    <option value="">Select Team Lead (None)</option>
                    {users.filter(x => x.roleName === 'team_lead' && x.id !== mappingUser.id).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setMappingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Mapping</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
