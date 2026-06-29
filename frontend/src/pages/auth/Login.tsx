import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Sun, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-up">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Sun size={26} color="#fff" />
          </div>
          <div className="login-logo-text">
            <h1>Aadhan Solar</h1>
            <p>Management Portal</p>
          </div>
        </div>

        <h2 className="login-heading">Welcome back 👋</h2>
        <p className="login-sub">Sign in to your account to continue</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="you@aadhansolar.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 36 }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
                onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 28, padding: '16px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
          <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-text-secondary)' }}>Demo Credentials</p>
          {[
            { role: 'Admin', email: 'admin@aadhansolar.com', pwd: 'Admin@123' },
            { role: 'Manager', email: 'manager@aadhansolar.com', pwd: 'Manager@123' },
            { role: 'Team Lead', email: 'teamlead@aadhansolar.com', pwd: 'Lead@123' },
            { role: 'Field Exec', email: 'exec@aadhansolar.com', pwd: 'Exec@123' },
            { role: 'Finance', email: 'finance@aadhansolar.com', pwd: 'Finance@123' },
          ].map(c => (
            <div key={c.role} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{c.role}:</span>
              <button style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 12 }}
                onClick={() => { setEmail(c.email); setPassword(c.pwd); }}>
                {c.email}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
