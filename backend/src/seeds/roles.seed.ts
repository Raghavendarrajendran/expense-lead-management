export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystem: boolean; // system roles cannot be deleted
  createdAt: string;
}

export const ROLES_SEED: Role[] = [
  {
    id: 'role_admin',
    name: 'admin',
    displayName: 'Admin',
    description: 'Full access to all modules and configurations',
    isActive: true,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_manager',
    name: 'manager',
    displayName: 'Manager',
    description: 'Manages leads, approves expenses, views reports',
    isActive: true,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_team_lead',
    name: 'team_lead',
    displayName: 'Team Lead',
    description: 'Manages team leads, approves team expenses',
    isActive: true,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_field_executive',
    name: 'field_executive',
    displayName: 'Field Executive',
    description: 'Handles assigned leads, submits expenses, updates site visits',
    isActive: true,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_finance_user',
    name: 'finance_user',
    displayName: 'Finance User',
    description: 'Verifies and processes expense reimbursements',
    isActive: true,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];
