export interface PermissionModule {
  id: string;
  name: string;
  description: string;
}

export const MODULES_SEED: PermissionModule[] = [
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
];
