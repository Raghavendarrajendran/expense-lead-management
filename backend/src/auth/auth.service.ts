import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InMemoryStore } from '../store/in-memory.store';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = this.store.getUserByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const permissions = this.store.getPermissionsForRole(user.roleName);
    const modules = this.store.getModules();
    const role = this.store.getRoleById(user.roleId);

    // Build dynamic menu based on permissions
    const menu = this.buildMenu(permissions, modules);

    const payload = { sub: user.id, email: user.email, roleId: user.roleId, roleName: user.roleName };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: { id: user.roleId, name: user.roleName, displayName: role?.displayName },
      },
      permissions: permissions.map(p => ({
        moduleId: p.moduleId,
        moduleName: modules.find(m => m.id === p.moduleId)?.name,
        actions: p.actions,
      })),
      menu,
    };
  }

  getMe(userId: string) {
    const user = this.store.getUserById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const permissions = this.store.getPermissionsForRole(user.roleName);
    const modules = this.store.getModules();
    const role = this.store.getRoleById(user.roleId);
    const menu = this.buildMenu(permissions, modules);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: { id: user.roleId, name: user.roleName, displayName: role?.displayName },
      },
      permissions: permissions.map(p => ({
        moduleId: p.moduleId,
        moduleName: modules.find(m => m.id === p.moduleId)?.name,
        actions: p.actions,
      })),
      menu,
    };
  }

  private buildMenu(permissions: any[], modules: any[]) {
    const menuMap: Record<string, { id: string; label: string; path: string; icon: string }> = {
      mod_dashboard:  { id: 'mod_dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      mod_leads:      { id: 'mod_leads', label: 'Leads', path: '/leads', icon: 'Users' },
      mod_site_visits:{ id: 'mod_site_visits', label: 'Site Visits', path: '/site-visits', icon: 'MapPin' },
      mod_expenses:   { id: 'mod_expenses', label: 'Expenses', path: '/expenses', icon: 'Receipt' },
      mod_approvals:  { id: 'mod_approvals', label: 'Approvals', path: '/approvals', icon: 'CheckCircle' },
      mod_finance:    { id: 'mod_finance', label: 'Finance', path: '/finance', icon: 'DollarSign' },
      mod_reports:    { id: 'mod_reports', label: 'Reports', path: '/reports', icon: 'BarChart2' },
      mod_users:      { id: 'mod_users', label: 'Users', path: '/users', icon: 'UserCog' },
      mod_roles:      { id: 'mod_roles', label: 'Roles & Permissions', path: '/roles', icon: 'ShieldCheck' },
      mod_settings:   { id: 'mod_settings', label: 'Settings', path: '/settings', icon: 'Settings' },
      mod_notifications: { id: 'mod_notifications', label: 'Notifications', path: '/notifications', icon: 'Bell' },
      mod_masters: { id: 'mod_masters', label: 'Master Management', path: '/masters', icon: 'Database' },

      // Pre-Sales
      mod_ps_leads:          { id: 'mod_ps_leads', label: 'PS Qualification', path: '/presales/leads', icon: 'UserCheck' },
      mod_ps_inspection_req: { id: 'mod_ps_inspection_req', label: 'PS Site Inspections', path: '/presales/inspection-requests', icon: 'ClipboardList' },
      mod_ps_engineering:    { id: 'mod_ps_engineering', label: 'PS Engineering Surveys', path: '/presales/engineering-surveys', icon: 'Sun' },
      mod_ps_array:          { id: 'mod_ps_array', label: 'PS Array Layouts', path: '/presales/array-layouts', icon: 'Zap' },
      mod_ps_sizing:         { id: 'mod_ps_sizing', label: 'PS Sizing Reports', path: '/presales/sizing-reports', icon: 'FileText' },
      mod_ps_bom:            { id: 'mod_ps_bom', label: 'PS BOM Management', path: '/presales/bom', icon: 'Package' },
      mod_ps_costing:        { id: 'mod_ps_costing', label: 'PS Cost Estimation', path: '/presales/costing', icon: 'Calculator' },
      mod_ps_proposals:      { id: 'mod_ps_proposals', label: 'PS Proposals (TCO)', path: '/presales/proposals', icon: 'FileCheck' },
      mod_ps_approvals:      { id: 'mod_ps_approvals', label: 'PS Internal Approvals', path: '/presales/proposal-approvals', icon: 'ThumbsUp' },
      mod_ps_revisions:      { id: 'mod_ps_revisions', label: 'PS Proposal Revisions', path: '/presales/revisions', icon: 'GitBranch' },
      mod_ps_followups:      { id: 'mod_ps_followups', label: 'PS Follow-ups', path: '/presales/followups', icon: 'MessageSquare' },
      mod_ps_orders:         { id: 'mod_ps_orders', label: 'PS Orders', path: '/presales/orders', icon: 'ShoppingCart' },
      mod_ps_payments:       { id: 'mod_ps_payments', label: 'PS Payments', path: '/presales/payments', icon: 'CreditCard' },
      mod_ps_change_requests:{ id: 'mod_ps_change_requests', label: 'PS Change Requests', path: '/presales/change-requests', icon: 'RefreshCw' },
      mod_ps_documents:      { id: 'mod_ps_documents', label: 'PS Documents', path: '/presales/documents', icon: 'FolderOpen' },
    };
    return permissions
      .filter(p => p.actions.includes('view'))
      .map(p => menuMap[p.moduleId])
      .filter(Boolean);
  }
}
