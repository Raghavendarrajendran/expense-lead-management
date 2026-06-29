import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, MapPin, Receipt, CheckCircle,
  DollarSign, BarChart2, UserCog, ShieldCheck, Settings,
  Sun, LogOut, X
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Users: <Users size={18} />,
  MapPin: <MapPin size={18} />,
  Receipt: <Receipt size={18} />,
  CheckCircle: <CheckCircle size={18} />,
  DollarSign: <DollarSign size={18} />,
  BarChart2: <BarChart2 size={18} />,
  UserCog: <UserCog size={18} />,
  ShieldCheck: <ShieldCheck size={18} />,
  Settings: <Settings size={18} />,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { menu, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sun size={20} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Aadhan Solar</span>
          <span className="sidebar-logo-subtitle">Management Portal</span>
        </div>
        <button className="btn-icon mobile-only" onClick={onClose} style={{ marginLeft: 'auto', color: '#fff' }}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menu.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-item-icon">{ICON_MAP[item.icon] || <LayoutDashboard size={18} />}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role?.displayName}</div>
          </div>
          <button className="btn-icon" onClick={handleLogout} title="Logout"
            style={{ color: 'rgba(255,255,255,.5)', marginLeft: 'auto' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
