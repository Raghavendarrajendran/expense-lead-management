import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, Filter, ExternalLink, Megaphone, Sparkles, BellRing
} from 'lucide-react';
import { getNotifications, markNotificationRead, markAllRead, deleteNotification } from '../../api/notifications.api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string; border: string }> = {
  URGENT: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: 'Urgent', border: 'rgba(239,68,68,0.2)' },
  HIGH:   { color: '#F97316', bg: 'rgba(249,115,22,0.1)', label: 'High',   border: 'rgba(249,115,22,0.2)' },
  MEDIUM: { color: '#2563EB', bg: 'rgba(37,99,235,0.08)', label: 'Medium', border: 'rgba(37,99,235,0.2)' },
  LOW:    { color: '#64748B', bg: 'rgba(100,116,139,0.08)', label: 'Low',  border: 'rgba(100,116,139,0.2)' },
};

const TYPE_ICON: Record<string, string> = {
  LEAD_ASSIGNED:        '👤',
  LEAD_STATUS_CHANGED:  '🔄',
  FOLLOW_UP_CREATED:    '📅',
  FOLLOW_UP_REMINDER:   '⏰',
  FOLLOW_UP_OVERDUE:    '🚨',
  EXPENSE_SUBMITTED:    '📋',
  EXPENSE_APPROVED:     '✅',
  EXPENSE_REJECTED:     '❌',
  FINANCE_VERIFIED:     '🔍',
  PAYMENT_MARKED_PAID:  '💸',
  ADMIN_ANNOUNCEMENT:   '📢',
};

export const NotificationsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAnnounce = ['admin', 'manager', 'team_lead'].includes(user?.role?.name || '');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterModule, setFilterModule] = useState('');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterUnread) params.unreadOnly = 'true';
      if (filterPriority) params.priority = filterPriority;
      if (filterModule) params.module = filterModule;
      const res = await getNotifications(params);
      setNotifications(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filterUnread, filterPriority, filterModule]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      toast.success('Marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.isRead) await handleMarkRead(notif.id);
    if (notif.actionUrl) navigate(notif.actionUrl);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const totalCount = notifications.length;
  const modules = Array.from(new Set(notifications.map(n => n.module).filter(Boolean)));

  return (
    <div className="animate-fade" style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            flexShrink: 0,
          }}>
            <BellRing size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '2px' }}>Notifications</h1>
            <p className="page-subtitle">Stay updated on leads, expenses, approvals, and announcements.</p>
          </div>
        </div>
        <div className="page-actions">
          {canAnnounce && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/notifications/announce')}>
              <Megaphone size={13} /> Send Announcement
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#fff', fontWeight: 600, fontSize: '12.5px', border: 'none',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                transition: 'all 0.15s',
              }}
            >
              <CheckCheck size={13} /> Mark All Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total',  value: totalCount,  color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
          { label: 'Unread', value: unreadCount, color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
          { label: 'Read',   value: totalCount - unreadCount, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '10px 18px', borderRadius: '10px',
            background: s.bg,
            border: `1px solid ${s.color}22`,
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: s.color, opacity: 0.7 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
            <Filter size={14} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Filters</span>
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px',
            cursor: 'pointer', fontWeight: filterUnread ? 700 : 500,
            color: filterUnread ? '#2563EB' : 'var(--color-text-secondary)',
            padding: '5px 10px', borderRadius: '7px',
            background: filterUnread ? 'rgba(37,99,235,0.08)' : 'transparent',
            border: `1px solid ${filterUnread ? 'rgba(37,99,235,0.2)' : 'transparent'}`,
            transition: 'all 0.15s',
          }}>
            <input type="checkbox" checked={filterUnread} onChange={e => setFilterUnread(e.target.checked)} style={{ accentColor: '#2563EB' }} />
            Unread Only
          </label>
          <select className="form-select" style={{ width: 'auto', fontSize: '12.5px', padding: '5px 10px' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto', fontSize: '12.5px', padding: '5px 10px' }} value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            <option value="">All Modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(filterUnread || filterPriority || filterModule) && (
            <button
              onClick={() => { setFilterUnread(false); setFilterPriority(''); setFilterModule(''); }}
              style={{ fontSize: '11.5px', color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Notification Cards */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(37,99,235,0.2)', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading notifications…</div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: '72px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(6,182,212,0.08))',
            border: '1px solid rgba(37,99,235,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Sparkles size={28} style={{ color: '#2563EB', opacity: 0.6 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>All caught up!</div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No notifications match your current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(notif => {
            const p = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.MEDIUM;
            const icon = TYPE_ICON[notif.type] || '🔔';
            return (
              <div
                key={notif.id}
                style={{
                  background: notif.isRead ? 'var(--color-surface)' : 'rgba(37,99,235,0.025)',
                  border: `1.5px solid ${notif.isRead ? 'var(--color-border)' : 'rgba(37,99,235,0.15)'}`,
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                  cursor: notif.actionUrl ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  boxShadow: notif.isRead ? 'none' : '0 2px 12px rgba(37,99,235,0.06)',
                  position: 'relative',
                }}
                onClick={() => notif.actionUrl && handleNotifClick(notif)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = notif.isRead ? 'none' : '0 2px 12px rgba(37,99,235,0.06)'; }}
              >
                {/* Unread indicator */}
                {!notif.isRead && (
                  <div style={{
                    position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)',
                    width: '9px', height: '9px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                    border: '2px solid var(--color-bg)',
                    boxShadow: '0 0 6px rgba(37,99,235,0.5)',
                  }} />
                )}

                {/* Type icon */}
                <div style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  borderRadius: '12px',
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: `0 2px 8px ${p.color}18`,
                }}>
                  {icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: notif.isRead ? 600 : 800, fontSize: '13.5px', color: 'var(--color-text-primary)' }}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span style={{
                        background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                        color: '#fff', fontSize: '9.5px', fontWeight: 800,
                        borderRadius: '20px', padding: '2px 7px',
                        letterSpacing: '0.04em',
                      }}>NEW</span>
                    )}
                    <span style={{
                      fontSize: '10.5px', fontWeight: 700, borderRadius: '7px', padding: '2px 7px',
                      background: p.bg, color: p.color,
                      border: `1px solid ${p.border}`,
                    }}>
                      {p.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 8px', lineHeight: 1.55 }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--color-text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      borderRadius: '6px', padding: '2px 8px', fontWeight: 600, fontSize: '10.5px',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {notif.module}
                    </span>
                    <span>·</span>
                    <span>{timeAgo(notif.createdAt)}</span>
                    {notif.actionUrl && (
                      <>
                        <span>·</span>
                        <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <ExternalLink size={10} /> Open record
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {!notif.isRead && (
                    <button
                      onClick={e => { e.stopPropagation(); handleMarkRead(notif.id); }}
                      title="Mark as read"
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                        background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)',
                        color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(notif.id); }}
                    title="Delete"
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                      color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
