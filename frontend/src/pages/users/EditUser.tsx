import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../../api/users.api';
import { getRoles } from '../../api/roles.api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    roleId: '',
    password: '',
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([getUser(id), getRoles()])
      .then(([userRes, rolesRes]) => {
        const u = userRes.data.data;
        setFormData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          designation: u.designation || '',
          roleId: u.roleId || '',
          password: '',
        });
        setRoles(rolesRes.data.data);
      })
      .catch(err => {
        toast.error('Failed to load user account');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const data: any = { ...formData };
      if (!data.password) delete data.password; // Do not send empty password override
      await updateUser(id, data);
      toast.success('User account updated successfully');
      navigate('/users');
    } catch (err: any) {
      toast.error('Failed to update user account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="edit-user animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/users')}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Edit User Account</h1>
          <p className="page-subtitle">Modify profile, credentials, or designation details.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                name="designation"
                className="form-input"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">User Role <span className="required">*</span></label>
              <select name="roleId" className="form-select" value={formData.roleId} onChange={handleChange} required>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.displayName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Override Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter new password to change..."
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
