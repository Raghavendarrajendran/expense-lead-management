import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoles, createRole, deleteRole } from '../../api/roles.api';
import { Plus, Shield, ShieldCheck, Trash2, Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showCreate, setShowCreate] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');

  const fetchRoles = () => {
    setLoading(true);
    getRoles()
      .then(res => setRoles(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    try {
      await createRole({
        displayName,
        name: displayName.toLowerCase().replace(/\s+/g, '_'),
        description,
      });
      toast.success('Role created successfully!');
      setShowCreate(false);
      setDisplayName('');
      setDescription('');
      fetchRoles();
    } catch (err: any) {
      toast.error('Failed to create role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteRole(id);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (err: any) {
      toast.error('Failed to delete role (system roles cannot be deleted)');
    }
  };

  return (
    <div className="role-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Role-based Access Control (RBAC)</h1>
          <p className="page-subtitle">Configure system access levels, page visibility, and action rules.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Custom Role
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ padding: '48px 0' }}>
          <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
        </div>
      ) : (
        <div className="grid-cols-3">
          {roles.map(role => (
            <div key={role.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield size={20} color="var(--color-navy)" />
                  <h3 style={{ margin: 0, fontWeight: 700 }}>{role.displayName}</h3>
                  {role.isSystem && (
                    <span className="badge badge-assigned" style={{ fontSize: '10px', padding: '2px 6px' }}>System</span>
                  )}
                </div>
                <p className="text-muted" style={{ fontSize: '13px' }}>{role.description || 'No description provided.'}</p>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <button className="btn btn-navy btn-sm" onClick={() => navigate(`/roles/${role.id}/permissions`)} style={{ flex: 1 }}>
                  <ShieldCheck size={14} /> Permissions Matrix
                </button>
                {!role.isSystem && (
                  <button className="btn btn-danger btn-icon" onClick={() => handleDelete(role.id)} title="Delete Role">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create Custom Role</h2>
              <button className="btn-icon" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Role Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Regional Supervisor"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe role responsibilities..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!displayName.trim()}>Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
