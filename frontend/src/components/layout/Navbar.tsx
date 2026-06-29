import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Menu } from 'lucide-react';

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
};

interface NavbarProps {
  onToggleMenu: () => void;
}

export const Navbar = ({ onToggleMenu }: NavbarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const label = ROUTE_LABELS[location.pathname] || 'Aadhan Solar';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="btn-icon mobile-only" onClick={onToggleMenu} style={{ marginRight: '8px', color: 'var(--color-text-primary)' }}>
          <Menu size={20} />
        </button>
        <span className="navbar-title">{label}</span>
      </div>
      <div className="navbar-right">
        <button className="btn-icon" style={{ color: 'var(--color-text-muted)', position: 'relative' }}>
          <Bell size={20} />
        </button>
        <div className="navbar-avatar" title={user?.name}>{initials}</div>
        <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/login'); }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};
