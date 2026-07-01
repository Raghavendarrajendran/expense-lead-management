export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'assign'
  | 'approve'
  | 'reject'
  | 'upload'
  | 'verify'
  | 'mark_as_paid'
  | 'export'
  | 'download'
  | 'comment'
  | 'change_status'
  | 'send'
  | 'send_to_all'
  | 'send_to_role'
  | 'send_to_team'
  | 'email_notify'
  | 'mark_as_read'
  // ── Pre-Sales specific actions ─────────────────────────────────
  | 'qualify'
  | 'disqualify'
  | 'request_inspection'
  | 'perform_inspection'
  | 'generate'
  | 'submit'
  | 'revise'
  | 'finalize'
  | 'track_payment'
  | 'manage_documents';

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'view', 'create', 'edit', 'delete', 'assign',
  'approve', 'reject', 'upload', 'verify', 'mark_as_paid',
  'export', 'download', 'comment', 'change_status',
  'send', 'send_to_all', 'send_to_role', 'send_to_team',
  'email_notify', 'mark_as_read',
  'qualify', 'disqualify', 'request_inspection', 'perform_inspection',
  'generate', 'submit', 'revise', 'finalize', 'track_payment', 'manage_documents',
];

export interface RolePermission {
  moduleId: string;
  actions: PermissionAction[];
}

// Full access helper
const ALL: PermissionAction[] = [...ALL_PERMISSION_ACTIONS];

// Pre-sales read-only shorthand
const PS_VIEW: PermissionAction[] = ['view'];

export const PERMISSIONS_SEED: Record<string, RolePermission[]> = {

  // ══════════════════════════════════════════════════════════════
  // ADMIN — Full access across everything
  // ══════════════════════════════════════════════════════════════
  admin: [
    { moduleId: 'mod_dashboard', actions: ALL },
    { moduleId: 'mod_leads', actions: ALL },
    { moduleId: 'mod_site_visits', actions: ALL },
    { moduleId: 'mod_expenses', actions: ALL },
    { moduleId: 'mod_approvals', actions: ALL },
    { moduleId: 'mod_finance', actions: ALL },
    { moduleId: 'mod_reports', actions: ALL },
    { moduleId: 'mod_users', actions: ALL },
    { moduleId: 'mod_roles', actions: ALL },
    { moduleId: 'mod_settings', actions: ALL },
    { moduleId: 'mod_notifications', actions: ALL },
    { moduleId: 'mod_masters', actions: ALL },
    // Pre-Sales — full access
    { moduleId: 'mod_ps_leads', actions: ALL },
    { moduleId: 'mod_ps_inspection_req', actions: ALL },
    { moduleId: 'mod_ps_engineering', actions: ALL },
    { moduleId: 'mod_ps_array', actions: ALL },
    { moduleId: 'mod_ps_sizing', actions: ALL },
    { moduleId: 'mod_ps_bom', actions: ALL },
    { moduleId: 'mod_ps_costing', actions: ALL },
    { moduleId: 'mod_ps_proposals', actions: ALL },
    { moduleId: 'mod_ps_approvals', actions: ALL },
    { moduleId: 'mod_ps_revisions', actions: ALL },
    { moduleId: 'mod_ps_followups', actions: ALL },
    { moduleId: 'mod_ps_orders', actions: ALL },
    { moduleId: 'mod_ps_payments', actions: ALL },
    { moduleId: 'mod_ps_change_requests', actions: ALL },
    { moduleId: 'mod_ps_documents', actions: ALL },
  ],

  // ══════════════════════════════════════════════════════════════
  // MANAGER
  // ══════════════════════════════════════════════════════════════
  manager: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_leads', actions: ['view', 'assign', 'edit', 'change_status', 'comment'] },
    { moduleId: 'mod_site_visits', actions: ['view'] },
    { moduleId: 'mod_expenses', actions: ['view'] },
    { moduleId: 'mod_approvals', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_reports', actions: ['view', 'export', 'download'] },
    { moduleId: 'mod_notifications', actions: ['view', 'create', 'send', 'send_to_team', 'email_notify', 'mark_as_read'] },
    // Pre-Sales
    { moduleId: 'mod_ps_leads', actions: ['view', 'qualify', 'disqualify', 'comment', 'request_inspection'] },
    { moduleId: 'mod_ps_inspection_req', actions: ['view', 'request_inspection', 'assign', 'change_status'] },
    { moduleId: 'mod_ps_engineering', actions: ['view'] },
    { moduleId: 'mod_ps_array', actions: ['view', 'approve', 'reject'] },
    { moduleId: 'mod_ps_sizing', actions: ['view'] },
    { moduleId: 'mod_ps_bom', actions: ['view', 'approve', 'reject'] },
    { moduleId: 'mod_ps_costing', actions: ['view', 'approve', 'reject'] },
    { moduleId: 'mod_ps_proposals', actions: ['view', 'approve', 'reject', 'revise', 'send'] },
    { moduleId: 'mod_ps_approvals', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_ps_revisions', actions: ['view'] },
    { moduleId: 'mod_ps_followups', actions: ['view', 'create', 'edit'] },
    { moduleId: 'mod_ps_orders', actions: ['view', 'approve'] },
    { moduleId: 'mod_ps_payments', actions: ['view'] },
    { moduleId: 'mod_ps_change_requests', actions: ['view', 'approve', 'reject'] },
    { moduleId: 'mod_ps_documents', actions: ['view', 'download'] },
  ],

  // ══════════════════════════════════════════════════════════════
  // TEAM LEAD
  // ══════════════════════════════════════════════════════════════
  team_lead: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_leads', actions: ['view', 'assign', 'change_status', 'comment'] },
    { moduleId: 'mod_site_visits', actions: ['view'] },
    { moduleId: 'mod_expenses', actions: ['view'] },
    { moduleId: 'mod_approvals', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_reports', actions: ['view'] },
    { moduleId: 'mod_notifications', actions: ['view', 'create', 'send', 'send_to_team', 'mark_as_read'] },
    // Pre-Sales — review and follow-up
    { moduleId: 'mod_ps_leads', actions: ['view', 'comment'] },
    { moduleId: 'mod_ps_inspection_req', actions: ['view', 'change_status'] },
    { moduleId: 'mod_ps_engineering', actions: ['view'] },
    { moduleId: 'mod_ps_array', actions: ['view'] },
    { moduleId: 'mod_ps_sizing', actions: ['view'] },
    { moduleId: 'mod_ps_bom', actions: ['view'] },
    { moduleId: 'mod_ps_costing', actions: ['view'] },
    { moduleId: 'mod_ps_proposals', actions: ['view'] },
    { moduleId: 'mod_ps_approvals', actions: ['view'] },
    { moduleId: 'mod_ps_revisions', actions: ['view'] },
    { moduleId: 'mod_ps_followups', actions: ['view', 'edit'] },
    { moduleId: 'mod_ps_orders', actions: ['view'] },
    { moduleId: 'mod_ps_payments', actions: ['view'] },
    { moduleId: 'mod_ps_change_requests', actions: ['view'] },
    { moduleId: 'mod_ps_documents', actions: ['view', 'download'] },
  ],

  // ══════════════════════════════════════════════════════════════
  // FIELD EXECUTIVE
  // ══════════════════════════════════════════════════════════════
  field_executive: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_leads', actions: ['view', 'edit', 'comment', 'change_status'] },
    { moduleId: 'mod_site_visits', actions: ['view', 'edit', 'upload'] },
    { moduleId: 'mod_expenses', actions: ['view', 'create', 'edit', 'upload'] },
    { moduleId: 'mod_reports', actions: ['view'] },
    { moduleId: 'mod_notifications', actions: ['view', 'mark_as_read'] },
    // Pre-Sales — limited visibility
    { moduleId: 'mod_ps_inspection_req', actions: ['view'] },
    { moduleId: 'mod_ps_engineering', actions: ['view', 'perform_inspection', 'upload'] },
    { moduleId: 'mod_ps_followups', actions: ['view', 'edit'] },
  ],

  // ══════════════════════════════════════════════════════════════
  // FINANCE USER
  // ══════════════════════════════════════════════════════════════
  finance_user: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_expenses', actions: ['view'] },
    { moduleId: 'mod_finance', actions: ['view', 'verify', 'reject', 'mark_as_paid', 'comment'] },
    { moduleId: 'mod_reports', actions: ['view', 'export', 'download'] },
    { moduleId: 'mod_notifications', actions: ['view', 'mark_as_read'] },
    // Pre-Sales — costing & payments
    { moduleId: 'mod_ps_costing', actions: ['view'] },
    { moduleId: 'mod_ps_orders', actions: ['view'] },
    { moduleId: 'mod_ps_payments', actions: ['view', 'track_payment', 'edit', 'verify'] },
    { moduleId: 'mod_ps_documents', actions: ['view', 'download', 'upload'] },
  ],

  // ══════════════════════════════════════════════════════════════
  // SALES EXECUTIVE — Pre-Sales primary role
  // ══════════════════════════════════════════════════════════════
  sales_executive: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_notifications', actions: ['view', 'mark_as_read'] },
    // Pre-Sales — full pipeline ownership
    { moduleId: 'mod_ps_leads', actions: ['view', 'create', 'edit', 'qualify', 'disqualify', 'comment', 'request_inspection'] },
    { moduleId: 'mod_ps_inspection_req', actions: ['view', 'request_inspection', 'assign'] },
    { moduleId: 'mod_ps_engineering', actions: ['view'] },
    { moduleId: 'mod_ps_array', actions: ['view'] },
    { moduleId: 'mod_ps_sizing', actions: ['view'] },
    { moduleId: 'mod_ps_bom', actions: ['view'] },
    { moduleId: 'mod_ps_costing', actions: ['view'] },
    { moduleId: 'mod_ps_proposals', actions: ['view', 'create', 'edit', 'submit', 'revise', 'send'] },
    { moduleId: 'mod_ps_approvals', actions: ['view', 'submit'] },
    { moduleId: 'mod_ps_revisions', actions: ['view', 'create'] },
    { moduleId: 'mod_ps_followups', actions: ['view', 'create', 'edit'] },
    { moduleId: 'mod_ps_orders', actions: ['view', 'finalize'] },
    { moduleId: 'mod_ps_payments', actions: ['view', 'track_payment'] },
    { moduleId: 'mod_ps_change_requests', actions: ['view', 'create', 'edit'] },
    { moduleId: 'mod_ps_documents', actions: ['view', 'upload', 'download', 'manage_documents'] },
  ],

  // ══════════════════════════════════════════════════════════════
  // ENGINEERING USER — Technical pre-sales role
  // ══════════════════════════════════════════════════════════════
  engineering_user: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_notifications', actions: ['view', 'mark_as_read'] },
    // Pre-Sales — engineering tasks
    { moduleId: 'mod_ps_leads', actions: ['view'] },
    { moduleId: 'mod_ps_inspection_req', actions: ['view', 'change_status'] },
    { moduleId: 'mod_ps_engineering', actions: ['view', 'create', 'edit', 'perform_inspection', 'upload'] },
    { moduleId: 'mod_ps_array', actions: ['view', 'create', 'edit', 'submit'] },
    { moduleId: 'mod_ps_sizing', actions: ['view', 'create', 'edit', 'generate'] },
    { moduleId: 'mod_ps_bom', actions: ['view', 'create', 'edit', 'submit'] },
    { moduleId: 'mod_ps_costing', actions: ['view'] },
    { moduleId: 'mod_ps_proposals', actions: ['view', 'approve'] },
    { moduleId: 'mod_ps_approvals', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_ps_revisions', actions: ['view'] },
    { moduleId: 'mod_ps_followups', actions: ['view'] },
    { moduleId: 'mod_ps_orders', actions: ['view'] },
    { moduleId: 'mod_ps_payments', actions: ['view'] },
    { moduleId: 'mod_ps_change_requests', actions: ['view', 'comment'] },
    { moduleId: 'mod_ps_documents', actions: ['view', 'upload', 'download', 'manage_documents'] },
  ],

  // ══════════════════════════════════════════════════════════════
  // COMMERCIAL USER — Commercial/finance pre-sales role
  // ══════════════════════════════════════════════════════════════
  commercial_user: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_notifications', actions: ['view', 'mark_as_read'] },
    // Pre-Sales — commercial tasks
    { moduleId: 'mod_ps_leads', actions: ['view'] },
    { moduleId: 'mod_ps_inspection_req', actions: ['view'] },
    { moduleId: 'mod_ps_engineering', actions: ['view'] },
    { moduleId: 'mod_ps_array', actions: ['view'] },
    { moduleId: 'mod_ps_sizing', actions: ['view'] },
    { moduleId: 'mod_ps_bom', actions: ['view', 'edit'] },
    { moduleId: 'mod_ps_costing', actions: ['view', 'create', 'edit', 'generate'] },
    { moduleId: 'mod_ps_proposals', actions: ['view', 'create', 'edit', 'approve', 'reject', 'revise', 'send'] },
    { moduleId: 'mod_ps_approvals', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_ps_revisions', actions: ['view', 'create'] },
    { moduleId: 'mod_ps_followups', actions: ['view', 'create', 'edit'] },
    { moduleId: 'mod_ps_orders', actions: ['view', 'create', 'edit', 'finalize'] },
    { moduleId: 'mod_ps_payments', actions: ['view', 'create', 'edit', 'track_payment', 'verify'] },
    { moduleId: 'mod_ps_change_requests', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_ps_documents', actions: ['view', 'upload', 'download', 'manage_documents'] },
  ],
};
