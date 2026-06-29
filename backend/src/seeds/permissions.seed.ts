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
  | 'change_status';

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'view', 'create', 'edit', 'delete', 'assign',
  'approve', 'reject', 'upload', 'verify', 'mark_as_paid',
  'export', 'download', 'comment', 'change_status',
];

export interface RolePermission {
  moduleId: string;
  actions: PermissionAction[];
}

// Full access helper
const ALL: PermissionAction[] = [...ALL_PERMISSION_ACTIONS];

export const PERMISSIONS_SEED: Record<string, RolePermission[]> = {
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
  ],
  manager: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_leads', actions: ['view', 'assign', 'edit', 'change_status', 'comment'] },
    { moduleId: 'mod_site_visits', actions: ['view'] },
    { moduleId: 'mod_expenses', actions: ['view'] },
    { moduleId: 'mod_approvals', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_reports', actions: ['view', 'export', 'download'] },
  ],
  team_lead: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_leads', actions: ['view', 'assign', 'change_status', 'comment'] },
    { moduleId: 'mod_site_visits', actions: ['view'] },
    { moduleId: 'mod_expenses', actions: ['view'] },
    { moduleId: 'mod_approvals', actions: ['view', 'approve', 'reject', 'comment'] },
    { moduleId: 'mod_reports', actions: ['view'] },
  ],
  field_executive: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_leads', actions: ['view', 'edit', 'comment', 'change_status'] },
    { moduleId: 'mod_site_visits', actions: ['view', 'edit', 'upload'] },
    { moduleId: 'mod_expenses', actions: ['view', 'create', 'edit', 'upload'] },
    { moduleId: 'mod_reports', actions: ['view'] },
  ],
  finance_user: [
    { moduleId: 'mod_dashboard', actions: ['view'] },
    { moduleId: 'mod_expenses', actions: ['view'] },
    { moduleId: 'mod_finance', actions: ['view', 'verify', 'reject', 'mark_as_paid', 'comment'] },
    { moduleId: 'mod_reports', actions: ['view', 'export', 'download'] },
  ],
};
