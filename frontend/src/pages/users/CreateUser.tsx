import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../api/users.api';
import { getRoles } from '../../api/roles.api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateUser = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    roleId: '',
    password: '',
  });

  useEffect(() => {
    getRoles()
      .then(res => {
        setRoles(res.data.data);
        if (res.data.data.length > 0) {
          setFormData(prev => ({ ...prev, roleId: res.data.data[0].id }));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.roleId) {
      toast.error('Name, Email and Role are required');
      return;
    }
    setLoading(true);
    try {
      await createUser(formData);
      toast.success('User account created successfully!');
      navigate('/users');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/users')}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Create User Account</h1>
          <p className="page-subtitle">Configure login credentials and details for field executives & finance staff.</p>
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
                placeholder="Enter user full name"
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
                placeholder="user@zsmart.com"
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
                placeholder="Enter 10-digit mobile"
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
                placeholder="e.g. Senior Project Manager"
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
              <label className="form-label">Initial Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Leave blank for default (Password@123)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
