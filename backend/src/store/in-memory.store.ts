import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ROLES_SEED, Role } from '../seeds/roles.seed';
import { USERS_SEED, User } from '../seeds/users.seed';
import { PERMISSIONS_SEED, RolePermission } from '../seeds/permissions.seed';
import { MODULES_SEED, PermissionModule } from '../seeds/modules.seed';
import { LEADS_MOCK, Lead } from '../mock/leads.mock';
import { EXPENSES_MOCK, Expense } from '../mock/expenses.mock';
import { SITE_VISITS_MOCK, SiteVisit } from '../mock/site-visits.mock';
import { APPROVALS_MOCK, ApprovalRecord } from '../mock/approvals.mock';
import { Notification } from '../notifications/interfaces/notification.interface';

export interface RoleLimit {
  roleId: string;
  roleName: string;
  weeklyLimit: number;
  monthlyLimit: number;
}

@Injectable()
export class InMemoryStore {
  // ── Static seeded data (survive restarts) ──────────────────────────
  private roles: Role[] = [...ROLES_SEED];
  private users: User[] = [...USERS_SEED];
  private permissions: Record<string, RolePermission[]> = { ...PERMISSIONS_SEED };
  private modules: PermissionModule[] = [...MODULES_SEED];
  private roleLimits: RoleLimit[] = [
    { roleId: 'role_admin', roleName: 'admin', weeklyLimit: 0, monthlyLimit: 0 },
    { roleId: 'role_manager', roleName: 'manager', weeklyLimit: 15000, monthlyLimit: 60000 },
    { roleId: 'role_team_lead', roleName: 'team_lead', weeklyLimit: 10000, monthlyLimit: 40000 },
    { roleId: 'role_field_executive', roleName: 'field_executive', weeklyLimit: 5000, monthlyLimit: 20000 },
    { roleId: 'role_finance_user', roleName: 'finance_user', weeklyLimit: 0, monthlyLimit: 0 }
  ];

  // ── Runtime data (reset on restart) ────────────────────────────────
  private leads: Lead[] = [...LEADS_MOCK];
  private expenses: Expense[] = [...EXPENSES_MOCK];
  private siteVisits: SiteVisit[] = [...SITE_VISITS_MOCK];
  private approvals: ApprovalRecord[] = [...APPROVALS_MOCK];
  private notifications: Notification[] = [];

  // ── Roles ───────────────────────────────────────────────────────────
  getRoles(): Role[] { return this.roles; }
  getRoleById(id: string): Role | undefined { return this.roles.find(r => r.id === id); }
  getRoleByName(name: string): Role | undefined { return this.roles.find(r => r.name === name); }
  createRole(data: Partial<Role>): Role {
    const role: Role = { id: `role_${uuidv4()}`, isSystem: false, isActive: true, createdAt: new Date().toISOString(), ...data } as Role;
    this.roles.push(role);
    return role;
  }
  updateRole(id: string, data: Partial<Role>): Role | null {
    const idx = this.roles.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.roles[idx] = { ...this.roles[idx], ...data };
    return this.roles[idx];
  }
  deleteRole(id: string): boolean {
    const role = this.getRoleById(id);
    if (!role || role.isSystem) return false;
    this.roles = this.roles.filter(r => r.id !== id);
    return true;
  }

  // ── Users ───────────────────────────────────────────────────────────
  getUsers(): User[] { return this.users; }
  getUserById(id: string): User | undefined { return this.users.find(u => u.id === id); }
  getUserByEmail(email: string): User | undefined { return this.users.find(u => u.email === email); }
  createUser(data: Partial<User>): User {
    const user: User = { id: `usr_${uuidv4()}`, isActive: true, createdAt: new Date().toISOString(), managerId: null, teamLeadId: null, ...data } as User;
    this.users.push(user);
    return user;
  }
  updateUser(id: string, data: Partial<User>): User | null {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...data };
    return this.users[idx];
  }
  deleteUser(id: string): boolean {
    const len = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < len;
  }

  // ── Permissions ─────────────────────────────────────────────────────
  getModules(): PermissionModule[] { return this.modules; }
  getPermissionsForRole(roleName: string): RolePermission[] { return this.permissions[roleName] || []; }
  setPermissionsForRole(roleName: string, perms: RolePermission[]): void { this.permissions[roleName] = perms; }
  hasPermission(roleName: string, moduleId: string, action: string): boolean {
    const rolePerms = this.permissions[roleName] || [];
    const mod = rolePerms.find(p => p.moduleId === moduleId);
    return mod ? (mod.actions as string[]).includes(action) : false;
  }

  // ── Leads ───────────────────────────────────────────────────────────
  getLeads(): Lead[] { return this.leads; }
  getLeadById(id: string): Lead | undefined { return this.leads.find(l => l.id === id); }
  createLead(data: Partial<Lead>): Lead {
    const lead: Lead = { id: `lead_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), remarks: [], ...data } as Lead;
    this.leads.push(lead);
    return lead;
  }
  updateLead(id: string, data: Partial<Lead>): Lead | null {
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.leads[idx] = { ...this.leads[idx], ...data, updatedAt: new Date().toISOString() };
    return this.leads[idx];
  }
  deleteLead(id: string): boolean {
    const len = this.leads.length;
    this.leads = this.leads.filter(l => l.id !== id);
    return this.leads.length < len;
  }

  // ── Site Visits ─────────────────────────────────────────────────────
  getSiteVisits(): SiteVisit[] { return this.siteVisits; }
  getSiteVisitById(id: string): SiteVisit | undefined { return this.siteVisits.find(s => s.id === id); }
  createSiteVisit(data: Partial<SiteVisit>): SiteVisit {
    const sv: SiteVisit = { id: `sv_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), photos: [], ...data } as SiteVisit;
    this.siteVisits.push(sv);
    return sv;
  }
  updateSiteVisit(id: string, data: Partial<SiteVisit>): SiteVisit | null {
    const idx = this.siteVisits.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.siteVisits[idx] = { ...this.siteVisits[idx], ...data, updatedAt: new Date().toISOString() };
    return this.siteVisits[idx];
  }

  // ── Expenses ────────────────────────────────────────────────────────
  getExpenses(): Expense[] { return this.expenses; }
  getExpenseById(id: string): Expense | undefined { return this.expenses.find(e => e.id === id); }
  createExpense(data: Partial<Expense>): Expense {
    const exp: Expense = { id: `exp_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), approvalHistory: [], ...data } as Expense;
    this.expenses.push(exp);
    return exp;
  }
  updateExpense(id: string, data: Partial<Expense>): Expense | null {
    const idx = this.expenses.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.expenses[idx] = { ...this.expenses[idx], ...data, updatedAt: new Date().toISOString() };
    return this.expenses[idx];
  }

  // ── Approvals ───────────────────────────────────────────────────────
  getApprovals(): ApprovalRecord[] { return this.approvals; }
  getApprovalById(id: string): ApprovalRecord | undefined { return this.approvals.find(a => a.id === id); }
  getApprovalByExpenseId(expenseId: string): ApprovalRecord | undefined { return this.approvals.find(a => a.expenseId === expenseId); }
  createApproval(data: Partial<ApprovalRecord>): ApprovalRecord {
    const rec: ApprovalRecord = { id: `apr_${uuidv4()}`, createdAt: new Date().toISOString(), history: [], ...data } as ApprovalRecord;
    this.approvals.push(rec);
    return rec;
  }
  updateApproval(id: string, data: Partial<ApprovalRecord>): ApprovalRecord | null {
    const idx = this.approvals.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.approvals[idx] = { ...this.approvals[idx], ...data };
    return this.approvals[idx];
  }

  // ── Role Limits ─────────────────────────────────────────────────────
  getRoleLimits(): RoleLimit[] { return this.roleLimits; }
  getRoleLimitByRoleId(roleId: string): RoleLimit | undefined { return this.roleLimits.find(l => l.roleId === roleId); }
  updateRoleLimit(roleId: string, data: Partial<RoleLimit>): RoleLimit | null {
    const idx = this.roleLimits.findIndex(l => l.roleId === roleId);
    if (idx === -1) {
      const role = this.getRoleById(roleId);
      const newLimit: RoleLimit = {
        roleId,
        roleName: role?.name || 'custom',
        weeklyLimit: data.weeklyLimit || 0,
        monthlyLimit: data.monthlyLimit || 0,
      };
      this.roleLimits.push(newLimit);
      return newLimit;
    }
    this.roleLimits[idx] = { ...this.roleLimits[idx], ...data };
    return this.roleLimits[idx];
  }

  // ── Notifications ───────────────────────────────────────────────────
  getNotifications(): Notification[] { return this.notifications; }
  getNotificationById(id: string): Notification | undefined { return this.notifications.find(n => n.id === id); }
  createNotification(data: Partial<Notification>): Notification {
    const notif: Notification = {
      id: `not_${uuidv4()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      receiverIds: [],
      channel: [],
      ...data,
    } as Notification;
    this.notifications.push(notif);
    return notif;
  }
  updateNotification(id: string, data: Partial<Notification>): Notification | null {
    const idx = this.notifications.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.notifications[idx] = { ...this.notifications[idx], ...data };
    return this.notifications[idx];
  }
  deleteNotification(id: string): boolean {
    const len = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== id);
    return this.notifications.length < len;
  }
}
