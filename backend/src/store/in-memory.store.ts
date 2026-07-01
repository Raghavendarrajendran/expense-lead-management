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
import {
  PresalesLead, SiteInspectionRequest, EngineeringSurvey,
  ArrayLayout, SizingReport, Bom, CostEstimation, Proposal,
  ProposalApprovalStep, ProposalRevision, CustomerFollowup,
  Order, AdvancePayment, ChangeRequest, PresalesDocument,
  PRESALES_LEADS_MOCK, SITE_INSPECTION_REQUESTS_MOCK,
  ENGINEERING_SURVEYS_MOCK, ARRAY_LAYOUTS_MOCK, SIZING_REPORTS_MOCK,
  BOMS_MOCK, COST_ESTIMATIONS_MOCK, PROPOSALS_MOCK,
  PROPOSAL_APPROVALS_MOCK, PROPOSAL_REVISIONS_MOCK,
  CUSTOMER_FOLLOWUPS_MOCK, ORDERS_MOCK, ADVANCE_PAYMENTS_MOCK,
  CHANGE_REQUESTS_MOCK, PRESALES_DOCUMENTS_MOCK,
} from '../mock/pre-sales.mock';

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
    { roleId: 'role_finance_user', roleName: 'finance_user', weeklyLimit: 0, monthlyLimit: 0 },
    { roleId: 'role_sales_executive', roleName: 'sales_executive', weeklyLimit: 0, monthlyLimit: 0 },
    { roleId: 'role_engineering_user', roleName: 'engineering_user', weeklyLimit: 0, monthlyLimit: 0 },
    { roleId: 'role_commercial_user', roleName: 'commercial_user', weeklyLimit: 0, monthlyLimit: 0 },
  ];

  // ── Runtime data (reset on restart) ────────────────────────────────
  private leads: Lead[] = [...LEADS_MOCK];
  private expenses: Expense[] = [...EXPENSES_MOCK];
  private siteVisits: SiteVisit[] = [...SITE_VISITS_MOCK];
  private approvals: ApprovalRecord[] = [...APPROVALS_MOCK];
  private notifications: Notification[] = [
    {
      id: 'notif_1',
      title: 'New Lead Assigned',
      message: 'A new lead "Acme Corp Survey" has been assigned to you.',
      type: 'LEAD_ASSIGNED' as any,
      channel: ['IN_APP'] as any,
      priority: 'HIGH' as any,
      receiverIds: ['usr_exec'],
      module: 'Lead Management',
      referenceId: 'lead_1',
      actionUrl: '/leads',
      isRead: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_2',
      title: 'Follow-up Scheduled',
      message: 'Follow-up with Arjun Das is scheduled for tomorrow.',
      type: 'FOLLOW_UP_REMINDER' as any,
      channel: ['IN_APP'] as any,
      priority: 'MEDIUM' as any,
      receiverIds: ['usr_exec'],
      module: 'Lead Management',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_3',
      title: 'Expense Claim Approved',
      message: 'Your claim for Petrol Bill (₹1,200) has been approved by Ravi Kumar.',
      type: 'EXPENSE_APPROVED' as any,
      channel: ['IN_APP'] as any,
      priority: 'LOW' as any,
      receiverIds: ['usr_exec'],
      module: 'Expense Management',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_4',
      title: 'New Expense Claim Submitted',
      message: 'Arjun Das has submitted an expense claim of ₹3,400 for Petrol Bill.',
      type: 'EXPENSE_SUBMITTED' as any,
      channel: ['IN_APP'] as any,
      priority: 'HIGH' as any,
      receiverIds: ['usr_teamlead', 'usr_manager'],
      module: 'Approvals',
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_5',
      title: 'Action Required: Verification Queue',
      message: 'Manager approved claims are waiting for Finance verification.',
      type: 'FINANCE_VERIFIED' as any,
      channel: ['IN_APP'] as any,
      priority: 'HIGH' as any,
      receiverIds: ['usr_finance'],
      module: 'Finance',
      isRead: false,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_6',
      title: 'New User Registered',
      message: 'A new User account for Meena Sharma (Finance) has been created.',
      type: 'ADMIN_ANNOUNCEMENT' as any,
      channel: ['IN_APP'] as any,
      priority: 'LOW' as any,
      receiverIds: ['usr_admin'],
      module: 'User Management',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_7',
      title: 'System Update Completed',
      message: 'ZSmart has been upgraded to v2.0.0 with Pre-Sales CRM modules.',
      type: 'ADMIN_ANNOUNCEMENT' as any,
      channel: ['IN_APP'] as any,
      priority: 'MEDIUM' as any,
      receiverIds: ['usr_admin', 'usr_manager', 'usr_teamlead', 'usr_exec', 'usr_finance', 'usr_sales', 'usr_engineer', 'usr_commercial'],
      module: 'Admin Announcements',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    // Pre-sales notifications
    {
      id: 'notif_8',
      title: 'Site Inspection Assigned',
      message: 'You have been assigned a site inspection for Sundar Rajan at Anna Nagar, Chennai on 05 Jul 2026.',
      type: 'INSPECTION_ASSIGNED' as any,
      channel: ['IN_APP'] as any,
      priority: 'HIGH' as any,
      receiverIds: ['usr_engineer'],
      module: 'Pre-Sales',
      referenceId: 'sir_001',
      actionUrl: '/presales/site-inspections/sir_001',
      isRead: false,
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_9',
      title: 'Proposal Approval Pending',
      message: 'Proposal TCO-2026-001 for Sundar Rajan is awaiting your approval.',
      type: 'PROPOSAL_APPROVAL_PENDING' as any,
      channel: ['IN_APP'] as any,
      priority: 'HIGH' as any,
      receiverIds: ['usr_manager'],
      module: 'Pre-Sales',
      referenceId: 'prop_001',
      actionUrl: '/presales/approvals',
      isRead: false,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    },
  ];

  // ── Pre-Sales Runtime Data ──────────────────────────────────────────
  private presalesLeads: PresalesLead[] = [...PRESALES_LEADS_MOCK];
  private siteInspectionRequests: SiteInspectionRequest[] = [...SITE_INSPECTION_REQUESTS_MOCK];
  private engineeringSurveys: EngineeringSurvey[] = [...ENGINEERING_SURVEYS_MOCK];
  private arrayLayouts: ArrayLayout[] = [...ARRAY_LAYOUTS_MOCK];
  private sizingReports: SizingReport[] = [...SIZING_REPORTS_MOCK];
  private boms: Bom[] = [...BOMS_MOCK];
  private costEstimations: CostEstimation[] = [...COST_ESTIMATIONS_MOCK];
  private proposals: Proposal[] = [...PROPOSALS_MOCK];
  private proposalApprovals: ProposalApprovalStep[] = [...PROPOSAL_APPROVALS_MOCK];
  private proposalRevisions: ProposalRevision[] = [...PROPOSAL_REVISIONS_MOCK];
  private customerFollowups: CustomerFollowup[] = [...CUSTOMER_FOLLOWUPS_MOCK];
  private orders: Order[] = [...ORDERS_MOCK];
  private advancePayments: AdvancePayment[] = [...ADVANCE_PAYMENTS_MOCK];
  private changeRequests: ChangeRequest[] = [...CHANGE_REQUESTS_MOCK];
  private presalesDocuments: PresalesDocument[] = [...PRESALES_DOCUMENTS_MOCK];

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

  // ════════════════════════════════════════════════════════════════════
  // PRE-SALES STORE METHODS
  // ════════════════════════════════════════════════════════════════════

  // ── Pre-Sales Leads ─────────────────────────────────────────────────
  getPresalesLeads(): PresalesLead[] { return this.presalesLeads; }
  getPresalesLeadById(id: string): PresalesLead | undefined { return this.presalesLeads.find(l => l.id === id); }
  createPresalesLead(data: Partial<PresalesLead>): PresalesLead {
    const lead: PresalesLead = { id: `ps_lead_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as PresalesLead;
    this.presalesLeads.push(lead);
    return lead;
  }
  updatePresalesLead(id: string, data: Partial<PresalesLead>): PresalesLead | null {
    const idx = this.presalesLeads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.presalesLeads[idx] = { ...this.presalesLeads[idx], ...data, updatedAt: new Date().toISOString() };
    return this.presalesLeads[idx];
  }
  deletePresalesLead(id: string): boolean {
    const len = this.presalesLeads.length;
    this.presalesLeads = this.presalesLeads.filter(l => l.id !== id);
    return this.presalesLeads.length < len;
  }

  // ── Site Inspection Requests ─────────────────────────────────────────
  getSiteInspectionRequests(): SiteInspectionRequest[] { return this.siteInspectionRequests; }
  getSiteInspectionRequestById(id: string): SiteInspectionRequest | undefined { return this.siteInspectionRequests.find(r => r.id === id); }
  createSiteInspectionRequest(data: Partial<SiteInspectionRequest>): SiteInspectionRequest {
    const req: SiteInspectionRequest = { id: `sir_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as SiteInspectionRequest;
    this.siteInspectionRequests.push(req);
    return req;
  }
  updateSiteInspectionRequest(id: string, data: Partial<SiteInspectionRequest>): SiteInspectionRequest | null {
    const idx = this.siteInspectionRequests.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.siteInspectionRequests[idx] = { ...this.siteInspectionRequests[idx], ...data, updatedAt: new Date().toISOString() };
    return this.siteInspectionRequests[idx];
  }
  deleteSiteInspectionRequest(id: string): boolean {
    const len = this.siteInspectionRequests.length;
    this.siteInspectionRequests = this.siteInspectionRequests.filter(r => r.id !== id);
    return this.siteInspectionRequests.length < len;
  }

  // ── Engineering Surveys ──────────────────────────────────────────────
  getEngineeringSurveys(): EngineeringSurvey[] { return this.engineeringSurveys; }
  getEngineeringSurveyById(id: string): EngineeringSurvey | undefined { return this.engineeringSurveys.find(s => s.id === id); }
  createEngineeringSurvey(data: Partial<EngineeringSurvey>): EngineeringSurvey {
    const survey: EngineeringSurvey = { id: `es_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), photos: [], ...data } as EngineeringSurvey;
    this.engineeringSurveys.push(survey);
    return survey;
  }
  updateEngineeringSurvey(id: string, data: Partial<EngineeringSurvey>): EngineeringSurvey | null {
    const idx = this.engineeringSurveys.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.engineeringSurveys[idx] = { ...this.engineeringSurveys[idx], ...data, updatedAt: new Date().toISOString() };
    return this.engineeringSurveys[idx];
  }

  // ── Array Layouts ────────────────────────────────────────────────────
  getArrayLayouts(): ArrayLayout[] { return this.arrayLayouts; }
  getArrayLayoutById(id: string): ArrayLayout | undefined { return this.arrayLayouts.find(a => a.id === id); }
  createArrayLayout(data: Partial<ArrayLayout>): ArrayLayout {
    const layout: ArrayLayout = { id: `al_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as ArrayLayout;
    this.arrayLayouts.push(layout);
    return layout;
  }
  updateArrayLayout(id: string, data: Partial<ArrayLayout>): ArrayLayout | null {
    const idx = this.arrayLayouts.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.arrayLayouts[idx] = { ...this.arrayLayouts[idx], ...data, updatedAt: new Date().toISOString() };
    return this.arrayLayouts[idx];
  }

  // ── Sizing Reports ────────────────────────────────────────────────────
  getSizingReports(): SizingReport[] { return this.sizingReports; }
  getSizingReportById(id: string): SizingReport | undefined { return this.sizingReports.find(r => r.id === id); }
  createSizingReport(data: Partial<SizingReport>): SizingReport {
    const report: SizingReport = { id: `sr_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as SizingReport;
    this.sizingReports.push(report);
    return report;
  }
  updateSizingReport(id: string, data: Partial<SizingReport>): SizingReport | null {
    const idx = this.sizingReports.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.sizingReports[idx] = { ...this.sizingReports[idx], ...data, updatedAt: new Date().toISOString() };
    return this.sizingReports[idx];
  }

  // ── BOMs ─────────────────────────────────────────────────────────────
  getBoms(): Bom[] { return this.boms; }
  getBomById(id: string): Bom | undefined { return this.boms.find(b => b.id === id); }
  createBom(data: Partial<Bom>): Bom {
    const bom: Bom = { id: `bom_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lineItems: [], totalAmount: 0, ...data } as Bom;
    this.boms.push(bom);
    return bom;
  }
  updateBom(id: string, data: Partial<Bom>): Bom | null {
    const idx = this.boms.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.boms[idx] = { ...this.boms[idx], ...data, updatedAt: new Date().toISOString() };
    return this.boms[idx];
  }

  // ── Cost Estimations ─────────────────────────────────────────────────
  getCostEstimations(): CostEstimation[] { return this.costEstimations; }
  getCostEstimationById(id: string): CostEstimation | undefined { return this.costEstimations.find(c => c.id === id); }
  createCostEstimation(data: Partial<CostEstimation>): CostEstimation {
    const est: CostEstimation = { id: `ce_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as CostEstimation;
    this.costEstimations.push(est);
    return est;
  }
  updateCostEstimation(id: string, data: Partial<CostEstimation>): CostEstimation | null {
    const idx = this.costEstimations.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.costEstimations[idx] = { ...this.costEstimations[idx], ...data, updatedAt: new Date().toISOString() };
    return this.costEstimations[idx];
  }

  // ── Proposals ────────────────────────────────────────────────────────
  getProposals(): Proposal[] { return this.proposals; }
  getProposalById(id: string): Proposal | undefined { return this.proposals.find(p => p.id === id); }
  createProposal(data: Partial<Proposal>): Proposal {
    const proposal: Proposal = { id: `prop_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1, ...data } as Proposal;
    this.proposals.push(proposal);
    return proposal;
  }
  updateProposal(id: string, data: Partial<Proposal>): Proposal | null {
    const idx = this.proposals.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.proposals[idx] = { ...this.proposals[idx], ...data, updatedAt: new Date().toISOString() };
    return this.proposals[idx];
  }
  deleteProposal(id: string): boolean {
    const len = this.proposals.length;
    this.proposals = this.proposals.filter(p => p.id !== id);
    return this.proposals.length < len;
  }

  // ── Proposal Approvals ────────────────────────────────────────────────
  getProposalApprovals(): ProposalApprovalStep[] { return this.proposalApprovals; }
  getProposalApprovalById(id: string): ProposalApprovalStep | undefined { return this.proposalApprovals.find(a => a.id === id); }
  getProposalApprovalsByProposalId(proposalId: string): ProposalApprovalStep[] { return this.proposalApprovals.filter(a => a.proposalId === proposalId); }
  createProposalApproval(data: Partial<ProposalApprovalStep>): ProposalApprovalStep {
    const step: ProposalApprovalStep = { id: `pa_${uuidv4()}`, createdAt: new Date().toISOString(), actionDate: null, ...data } as ProposalApprovalStep;
    this.proposalApprovals.push(step);
    return step;
  }
  updateProposalApproval(id: string, data: Partial<ProposalApprovalStep>): ProposalApprovalStep | null {
    const idx = this.proposalApprovals.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.proposalApprovals[idx] = { ...this.proposalApprovals[idx], ...data };
    return this.proposalApprovals[idx];
  }

  // ── Proposal Revisions ────────────────────────────────────────────────
  getProposalRevisions(): ProposalRevision[] { return this.proposalRevisions; }
  getProposalRevisionsByProposalId(proposalId: string): ProposalRevision[] { return this.proposalRevisions.filter(r => r.proposalId === proposalId); }
  createProposalRevision(data: Partial<ProposalRevision>): ProposalRevision {
    const rev: ProposalRevision = { id: `rev_${uuidv4()}`, createdAt: new Date().toISOString(), ...data } as ProposalRevision;
    this.proposalRevisions.push(rev);
    return rev;
  }

  // ── Customer Followups ────────────────────────────────────────────────
  getCustomerFollowups(): CustomerFollowup[] { return this.customerFollowups; }
  getCustomerFollowupById(id: string): CustomerFollowup | undefined { return this.customerFollowups.find(f => f.id === id); }
  createCustomerFollowup(data: Partial<CustomerFollowup>): CustomerFollowup {
    const followup: CustomerFollowup = { id: `cf_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as CustomerFollowup;
    this.customerFollowups.push(followup);
    return followup;
  }
  updateCustomerFollowup(id: string, data: Partial<CustomerFollowup>): CustomerFollowup | null {
    const idx = this.customerFollowups.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.customerFollowups[idx] = { ...this.customerFollowups[idx], ...data, updatedAt: new Date().toISOString() };
    return this.customerFollowups[idx];
  }

  // ── Orders ────────────────────────────────────────────────────────────
  getOrders(): Order[] { return this.orders; }
  getOrderById(id: string): Order | undefined { return this.orders.find(o => o.id === id); }
  createOrder(data: Partial<Order>): Order {
    const order: Order = { id: `ord_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as Order;
    this.orders.push(order);
    return order;
  }
  updateOrder(id: string, data: Partial<Order>): Order | null {
    const idx = this.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.orders[idx] = { ...this.orders[idx], ...data, updatedAt: new Date().toISOString() };
    return this.orders[idx];
  }

  // ── Advance Payments ──────────────────────────────────────────────────
  getAdvancePayments(): AdvancePayment[] { return this.advancePayments; }
  getAdvancePaymentById(id: string): AdvancePayment | undefined { return this.advancePayments.find(p => p.id === id); }
  createAdvancePayment(data: Partial<AdvancePayment>): AdvancePayment {
    const payment: AdvancePayment = { id: `pay_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as AdvancePayment;
    this.advancePayments.push(payment);
    return payment;
  }
  updateAdvancePayment(id: string, data: Partial<AdvancePayment>): AdvancePayment | null {
    const idx = this.advancePayments.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.advancePayments[idx] = { ...this.advancePayments[idx], ...data, updatedAt: new Date().toISOString() };
    return this.advancePayments[idx];
  }

  // ── Change Requests ───────────────────────────────────────────────────
  getChangeRequests(): ChangeRequest[] { return this.changeRequests; }
  getChangeRequestById(id: string): ChangeRequest | undefined { return this.changeRequests.find(c => c.id === id); }
  createChangeRequest(data: Partial<ChangeRequest>): ChangeRequest {
    const cr: ChangeRequest = { id: `cr_${uuidv4()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as ChangeRequest;
    this.changeRequests.push(cr);
    return cr;
  }
  updateChangeRequest(id: string, data: Partial<ChangeRequest>): ChangeRequest | null {
    const idx = this.changeRequests.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.changeRequests[idx] = { ...this.changeRequests[idx], ...data, updatedAt: new Date().toISOString() };
    return this.changeRequests[idx];
  }

  // ── Pre-Sales Documents ────────────────────────────────────────────────
  getPresalesDocuments(): PresalesDocument[] { return this.presalesDocuments; }
  getPresalesDocumentById(id: string): PresalesDocument | undefined { return this.presalesDocuments.find(d => d.id === id); }
  getPresalesDocumentsByEntity(entityId: string): PresalesDocument[] { return this.presalesDocuments.filter(d => d.entityId === entityId); }
  getPresalesDocumentsByLead(leadId: string): PresalesDocument[] { return this.presalesDocuments.filter(d => d.leadId === leadId); }
  createPresalesDocument(data: Partial<PresalesDocument>): PresalesDocument {
    const doc: PresalesDocument = { id: `psdoc_${uuidv4()}`, createdAt: new Date().toISOString(), ...data } as PresalesDocument;
    this.presalesDocuments.push(doc);
    return doc;
  }
  deletePresalesDocument(id: string): boolean {
    const len = this.presalesDocuments.length;
    this.presalesDocuments = this.presalesDocuments.filter(d => d.id !== id);
    return this.presalesDocuments.length < len;
  }

  // ── Master Lookup Management ──────────────────────────────────────────
  private masters: Record<string, string[]> = {
    leadSources: ['Website', 'Reference', 'Cold Call', 'Social Media', 'Expo/Event'],
    customerTypes: ['Residential', 'Commercial', 'Industrial', 'Agricultural'],
    customerCategories: ['Standard', 'Premium', 'Enterprise'],
    roofTypes: ['RCC Flat Roof', 'Metal Truss Sheet', 'Asbestos Sheet', 'Ground Mount Area'],
    panelTypes: ['Mono PERC 540Wp', 'Bifacial 550Wp', 'Polycrystalline 330Wp', 'TopCon 575Wp'],
    inverterTypes: ['Growatt 10kW On-grid', 'Solis 25kW On-grid', 'Fronius 15kW Hybrid', 'Delta 50kW On-grid'],
    documentCategories: ['Site Photo', 'Drawing', 'BOM', 'Proposal', 'PO', 'Payment Proof', 'Other'],
  };

  getMasters(): Record<string, string[]> {
    return this.masters;
  }

  updateMaster(key: string, values: string[]): Record<string, string[]> {
    this.masters[key] = values;
    return this.masters;
  }
}
