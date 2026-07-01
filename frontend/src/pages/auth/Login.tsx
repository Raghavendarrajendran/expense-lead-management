import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Cpu, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
          <div className="login-logo-icon" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-gold))' }}>
            <Cpu size={26} color="#fff" />
          </div>
          <div className="login-logo-text">
            <h1>ZSmart</h1>
            <p>Management Platform</p>
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
                placeholder="you@zsmart.com"
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
          <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-text-secondary)' }}>Demo Credentials (Click to Autofill)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            {[
              { role: 'Admin', email: 'admin@zsmart.com', pwd: 'Admin@123' },
              { role: 'Manager', email: 'manager@zsmart.com', pwd: 'Manager@123' },
              { role: 'Team Lead', email: 'teamlead@zsmart.com', pwd: 'Lead@123' },
              { role: 'Field Exec', email: 'exec@zsmart.com', pwd: 'Exec@123' },
              { role: 'Finance', email: 'finance@zsmart.com', pwd: 'Finance@123' },
              { role: 'Sales Exec', email: 'sales@zsmart.com', pwd: 'Sales@123' },
              { role: 'Engineer', email: 'engineer@zsmart.com', pwd: 'Engg@123' },
              { role: 'Commercial', email: 'commercial@zsmart.com', pwd: 'Comm@123' },
            ].map(c => (
              <div key={c.role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'rgba(0,0,0,0.02)', padding: '6px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>{c.role}</span>
                <button type="button" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '11px', textAlign: 'left', padding: 0 }}
                  onClick={() => { setEmail(c.email); setPassword(c.pwd); }}>
                  {c.email}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
