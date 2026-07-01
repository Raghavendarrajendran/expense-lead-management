import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, MapPin, Receipt, CheckCircle,
  DollarSign, BarChart2, UserCog, ShieldCheck, Settings,
  Cpu, LogOut, X, Bell, UserCheck, ClipboardList, Sun, Zap,
  FileText, Package, Calculator, FileCheck, ThumbsUp, GitBranch,
  MessageSquare, ShoppingCart, CreditCard, RefreshCw, FolderOpen, ChevronDown, Database
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
  Bell: <Bell size={18} />,

  // Pre-Sales Icon mappings
  UserCheck: <UserCheck size={18} />,
  ClipboardList: <ClipboardList size={18} />,
  Sun: <Sun size={18} />,
  Zap: <Zap size={18} />,
  FileText: <FileText size={18} />,
  Package: <Package size={18} />,
  Calculator: <Calculator size={18} />,
  FileCheck: <FileCheck size={18} />,
  ThumbsUp: <ThumbsUp size={18} />,
  GitBranch: <GitBranch size={18} />,
  MessageSquare: <MessageSquare size={18} />,
  ShoppingCart: <ShoppingCart size={18} />,
  CreditCard: <CreditCard size={18} />,
  RefreshCw: <RefreshCw size={18} />,
  FolderOpen: <FolderOpen size={18} />,
  Database: <Database size={18} />,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { menu, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const coreModuleIds = ['mod_dashboard', 'mod_leads', 'mod_site_visits', 'mod_expenses', 'mod_approvals', 'mod_finance', 'mod_reports'];
  const adminModuleIds = ['mod_users', 'mod_roles', 'mod_settings', 'mod_notifications', 'mod_masters'];

  const coreMenu = menu.filter(item => coreModuleIds.includes(item.id));
  const preSalesMenu = menu.filter(item => item.id.startsWith('mod_ps_'));
  const adminMenu = menu.filter(item => adminModuleIds.includes(item.id));

  // Collapsible Accordion States
  const [coreOpen, setCoreOpen] = useState(true);
  const [preSalesOpen, setPreSalesOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  // Helper to determine if any item in a list matches active path
  const hasActiveItem = (list: any[]) => {
    return list.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
  };

  // Sync open states with active route changes
  useEffect(() => {
    if (hasActiveItem(coreMenu)) setCoreOpen(true);
    if (hasActiveItem(preSalesMenu)) setPreSalesOpen(true);
    if (hasActiveItem(adminMenu)) setAdminOpen(true);
  }, [location.pathname, menu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-gold))' }}>
          <Cpu size={20} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title" style={{ letterSpacing: '0.05em' }}>ZSmart</span>
          <span className="sidebar-logo-subtitle">Enterprise Portal</span>
        </div>
        <button className="btn-icon mobile-only" onClick={onClose} style={{ marginLeft: 'auto', color: '#fff' }}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Core Operations Section */}
        {coreMenu.length > 0 && (
          <div className="sidebar-section">
            <button className="sidebar-section-header" onClick={() => setCoreOpen(!coreOpen)}>
              <span>Core Operations</span>
              <ChevronDown size={14} className={`chevron ${coreOpen ? 'open' : ''}`} />
            </button>
            {coreOpen && (
              <div className="sidebar-section-items">
                {coreMenu.map(item => (
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
              </div>
            )}
          </div>
        )}

        {/* Pre-Sales CRM Section */}
        {preSalesMenu.length > 0 && (
          <div className="sidebar-section">
            <button className="sidebar-section-header" onClick={() => setPreSalesOpen(!preSalesOpen)}>
              <span>Pre-Sales CRM</span>
              <ChevronDown size={14} className={`chevron ${preSalesOpen ? 'open' : ''}`} />
            </button>
            {preSalesOpen && (
              <div className="sidebar-section-items">
                {preSalesMenu.map(item => (
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
              </div>
            )}
          </div>
        )}

        {/* System Administration Section */}
        {adminMenu.length > 0 && (
          <div className="sidebar-section">
            <button className="sidebar-section-header" onClick={() => setAdminOpen(!adminOpen)}>
              <span>Administration</span>
              <ChevronDown size={14} className={`chevron ${adminOpen ? 'open' : ''}`} />
            </button>
            {adminOpen && (
              <div className="sidebar-section-items">
                {adminMenu.map(item => (
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
              </div>
            )}
          </div>
        )}
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
