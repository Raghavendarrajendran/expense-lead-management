import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Users, Globe, UsersRound } from 'lucide-react';
import { createNotification } from '../../api/notifications.api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TARGET_OPTIONS = [
  { value: 'all', label: 'All Users', icon: Globe },
  { value: 'role', label: 'By Role', icon: UsersRound },
  { value: 'team', label: 'My Team', icon: Users },
];

const ROLES = ['field_executive', 'team_lead', 'manager', 'finance_user', 'admin'];
const ROLE_LABELS: Record<string, string> = {
  field_executive: 'Field Executives',
  team_lead: 'Team Leads',
  manager: 'Managers',
  finance_user: 'Finance Users',
  admin: 'Admins',
};

export const AnnouncementForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [targetMode, setTargetMode] = useState<'all' | 'role' | 'team'>('team');
  const [targetRole, setTargetRole] = useState('field_executive');
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    const channels: string[] = [];
    if (channelInApp) channels.push('IN_APP');
    if (channelEmail) channels.push('EMAIL');
    if (channels.length === 0) {
      toast.error('Select at least one channel');
      return;
    }

    const payload: any = {
      title: title.trim(),
      message: message.trim(),
      priority,
      channel: channels,
      type: 'ADMIN_ANNOUNCEMENT',
      module: 'Admin Announcements',
    };

    if (targetMode === 'all' && isAdmin) {
      payload.targetAll = true;
    } else if (targetMode === 'role') {
      payload.targetRole = targetRole;
    } else {
      payload.targetTeam = true;
    }

    setLoading(true);
    try {
      await createNotification(payload);
      toast.success('Announcement sent successfully!');
      navigate('/notifications');
    } catch {
      toast.error('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="announcement-form animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/notifications')}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Send Announcement</h1>
          <p className="page-subtitle">Notify your team or organization with important updates.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">

          {/* Target Selection */}
          <div className="form-group">
            <label className="form-label">Notify Recipients</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {TARGET_OPTIONS.filter(opt => isAdmin || opt.value !== 'all').map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTargetMode(opt.value as any)}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${targetMode === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: targetMode === opt.value ? 'var(--color-primary)' : 'var(--color-surface-2)',
                      color: targetMode === opt.value ? '#fff' : 'var(--color-text-primary)',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={14} /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role selector (when mode = role) */}
          {targetMode === 'role' && (
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <select className="form-select" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                {ROLES.filter(r => isAdmin || r !== 'admin').map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Announcement Title <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="e.g. System Maintenance Notice" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message <span className="required">*</span></label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Write your announcement or update here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Channel */}
          <div className="form-group">
            <label className="form-label">Notification Channels</label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                <input type="checkbox" checked={channelInApp} onChange={e => setChannelInApp(e.target.checked)} />
                📱 In-App Notification
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                <input type="checkbox" checked={channelEmail} onChange={e => setChannelEmail(e.target.checked)} />
                📧 Email Notification (Mock)
              </label>
            </div>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginTop: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Preview</div>
              <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>{title || '(title)'}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{message || '(message)'}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/notifications')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={14} /> {loading ? 'Sending…' : 'Send Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
