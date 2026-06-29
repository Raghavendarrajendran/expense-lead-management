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
    };
    return permissions
      .filter(p => p.actions.includes('view'))
      .map(p => menuMap[p.moduleId])
      .filter(Boolean);
  }
}
