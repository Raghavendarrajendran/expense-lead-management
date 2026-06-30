import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Menu, BellRing, Check, CheckCheck, ExternalLink, Sparkles } from 'lucide-react';
import { getUnreadCount, getNotifications, markNotificationRead, markAllRead } from '../../api/notifications.api';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Management',
  '/site-visits': 'Site Visits',
  '/expenses': 'Expenses',
  '/approvals': 'Approvals',
  '/finance': 'Finance',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/roles': 'Roles & Permissions',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  URGENT: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Urgent' },
  HIGH:   { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'High' },
  MEDIUM: { color: '#2563EB', bg: 'rgba(37,99,235,0.12)', label: 'Medium' },
  LOW:    { color: '#64748B', bg: 'rgba(100,116,139,0.12)', label: 'Low' },
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

interface NavbarProps {
  onToggleMenu: () => void;
}

export const Navbar = ({ onToggleMenu }: NavbarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const label = ROUTE_LABELS[location.pathname] || 'ZSmart';
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.data?.count ?? res.data?.count ?? 0);
    } catch { /* silent */ }
  }, []);

  const fetchRecentNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await getNotifications({ unreadOnly: 'false' });
      const all = res.data?.data ?? res.data ?? [];
      setNotifications(all.slice(0, 10));
    } catch { /* silent */ }
    finally { setLoadingNotifs(false); }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (showDropdown) fetchRecentNotifications();
  }, [showDropdown, fetchRecentNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (notif: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
    setShowDropdown(false);
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

  const hasUnread = unreadCount > 0;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="btn-icon mobile-only" onClick={onToggleMenu} style={{ marginRight: '8px', color: 'var(--color-text-primary)' }}>
          <Menu size={20} />
        </button>
        <span className="navbar-title">{label}</span>
      </div>
      <div className="navbar-right">

        {/* ── NOTIFICATION BELL ─────────────────────────────── */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            title="Notifications"
            className="notif-bell-btn"
            style={{
              width: '40px', height: '40px',
              borderRadius: '12px',
              background: showDropdown
                ? 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.1))'
                : hasUnread ? 'rgba(37,99,235,0.08)' : 'var(--color-surface-2)',
              border: `1.5px solid ${showDropdown || hasUnread ? 'rgba(37,99,235,0.25)' : 'var(--color-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
              transition: 'all 0.2s ease',
              boxShadow: showDropdown ? '0 4px 14px rgba(37,99,235,0.2)' : 'none',
            }}
          >
            {hasUnread
              ? <BellRing size={18} style={{ color: '#2563EB' }} />
              : <Bell size={18} style={{ color: 'var(--color-text-muted)' }} />
            }
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'linear-gradient(135deg, #EF4444, #F97316)',
                color: '#fff', borderRadius: '20px',
                fontSize: '9.5px', fontWeight: 800,
                minWidth: '18px', height: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', lineHeight: 1,
                border: '2px solid var(--color-surface)',
                boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
                animation: 'pulse 2s infinite',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0,
              width: '380px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(37,99,235,0.05)',
              zIndex: 9999,
              overflow: 'hidden',
              animation: 'notifDropIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            }}>

              {/* Header */}
              <div style={{
                padding: '14px 16px',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(6,182,212,0.03))',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bell size={13} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--color-text-primary)' }}>Notifications</div>
                    {unreadCount > 0 && (
                      <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>{unreadCount} unread</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        fontSize: '11px', fontWeight: 600, color: '#2563EB',
                        background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)',
                        borderRadius: '6px', padding: '4px 8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <CheckCheck size={11} /> Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                    style={{
                      padding: '4px 8px', borderRadius: '6px', cursor: 'pointer',
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                      gap: '3px', fontSize: '11px',
                    }}
                    title="View all"
                  >
                    <ExternalLink size={11} /> All
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {loadingNotifs ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Loading…</div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '14px',
                      background: 'var(--color-surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}>
                      <Sparkles size={22} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>All caught up!</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No notifications yet.</div>
                  </div>
                ) : (
                  notifications.map((notif, idx) => {
                    const p = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.MEDIUM;
                    const icon = TYPE_ICON[notif.type] || '🔔';
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: idx < notifications.length - 1 ? '1px solid var(--color-border)' : 'none',
                          background: notif.isRead ? 'transparent' : 'rgba(37,99,235,0.03)',
                          display: 'flex', gap: '12px', alignItems: 'flex-start',
                          transition: 'background 0.12s',
                          position: 'relative',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(37,99,235,0.03)')}
                      >
                        {/* Unread dot */}
                        {!notif.isRead && (
                          <div style={{
                            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: '#2563EB',
                          }} />
                        )}

                        {/* Icon pill */}
                        <div style={{
                          width: '36px', height: '36px', flexShrink: 0,
                          borderRadius: '10px',
                          background: p.bg,
                          border: `1px solid ${p.color}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px',
                        }}>
                          {icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: notif.isRead ? 500 : 700,
                            fontSize: '12.5px',
                            marginBottom: '2px',
                            color: 'var(--color-text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {notif.title}
                          </div>
                          <div style={{
                            fontSize: '11.5px', color: 'var(--color-text-secondary)',
                            lineHeight: 1.4, overflow: 'hidden',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          }}>
                            {notif.message}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '5px', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 600, borderRadius: '5px',
                              padding: '1px 6px',
                              background: p.bg, color: p.color,
                            }}>
                              {p.label}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>·</span>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{notif.module}</span>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>·</span>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{timeAgo(notif.createdAt)}</span>
                          </div>
                        </div>

                        {/* Mark read button */}
                        {!notif.isRead && (
                          <button
                            onClick={e => handleMarkRead(notif, e)}
                            title="Mark as read"
                            style={{
                              flexShrink: 0, padding: '4px',
                              borderRadius: '6px', cursor: 'pointer',
                              background: 'rgba(37,99,235,0.08)',
                              border: '1px solid rgba(37,99,235,0.15)',
                              color: '#2563EB', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)',
              }}>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                  style={{
                    width: '100%', padding: '8px',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: '#fff', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '12.5px', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}
                >
                  <ExternalLink size={12} /> View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '6px 10px',
          borderRadius: '10px',
          background: 'var(--color-surface-2)',
          border: '1.5px solid var(--color-border)',
        }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: '#fff',
            boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }} className="tablet-hide">
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{user?.name?.split(' ')[0]}</span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{user?.role?.displayName}</span>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ gap: '6px' }}
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </header>
  );
};
