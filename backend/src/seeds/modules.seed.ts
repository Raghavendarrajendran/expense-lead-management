export interface PermissionModule {
  id: string;
  name: string;
  description: string;
}

export const MODULES_SEED: PermissionModule[] = [
  // ── Existing Modules ────────────────────────────────────────────
  { id: 'mod_dashboard', name: 'Dashboard', description: 'Dashboard and KPI cards' },
  { id: 'mod_leads', name: 'Lead Management', description: 'Lead creation, assignment and tracking' },
  { id: 'mod_site_visits', name: 'Site Visit', description: 'Site survey scheduling and updates' },
  { id: 'mod_expenses', name: 'Expense Management', description: 'Expense submission and tracking' },
  { id: 'mod_approvals', name: 'Expense Approval', description: 'Approve or reject expense claims' },
  { id: 'mod_finance', name: 'Finance Verification', description: 'Finance verification and payment' },
  { id: 'mod_reports', name: 'Reports', description: 'All report types and exports' },
  { id: 'mod_users', name: 'User Management', description: 'Create and manage users' },
  { id: 'mod_roles', name: 'Role Management', description: 'Create and manage roles and permissions' },
  { id: 'mod_settings', name: 'Settings', description: 'Application settings' },
  { id: 'mod_notifications', name: 'Notifications', description: 'In-app and email notifications' },
  { id: 'mod_masters', name: 'Master Data Management', description: 'Manage lookup masters (Lead sources, panel types, inverter types, etc.)' },

  // ── Pre-Sales Modules ────────────────────────────────────────────
  { id: 'mod_ps_leads', name: 'PS Lead Qualification', description: 'Qualify and manage pre-sales leads' },
  { id: 'mod_ps_inspection_req', name: 'PS Site Inspection Request', description: 'Request and assign engineering site inspections' },
  { id: 'mod_ps_engineering', name: 'PS Engineering Survey', description: 'Capture engineering site survey data and feasibility' },
  { id: 'mod_ps_array', name: 'PS Array Layout', description: 'Solar panel array layout and design' },
  { id: 'mod_ps_sizing', name: 'PS Sizing Report', description: 'System sizing and generation estimates' },
  { id: 'mod_ps_bom', name: 'PS BOM Management', description: 'Bill of Materials builder and management' },
  { id: 'mod_ps_costing', name: 'PS Cost Estimation', description: 'Project cost and tax estimation' },
  { id: 'mod_ps_proposals', name: 'PS Proposals (TCO)', description: 'Technical Commercial Offer proposal generation' },
  { id: 'mod_ps_approvals', name: 'PS Internal Approvals', description: 'Multi-stage internal proposal approval workflow' },
  { id: 'mod_ps_revisions', name: 'PS Proposal Revisions', description: 'Proposal revision history and change tracking' },
  { id: 'mod_ps_followups', name: 'PS Customer Follow-ups', description: 'Customer review and negotiation follow-up log' },
  { id: 'mod_ps_orders', name: 'PS Order Finalization', description: 'PO receipt and order handover management' },
  { id: 'mod_ps_payments', name: 'PS Advance Payments', description: 'Advance payment milestone tracking' },
  { id: 'mod_ps_change_requests', name: 'PS Change Requests', description: 'Specification and capacity change requests' },
  { id: 'mod_ps_documents', name: 'PS Documents', description: 'Document management for pre-sales lifecycle' },
];
