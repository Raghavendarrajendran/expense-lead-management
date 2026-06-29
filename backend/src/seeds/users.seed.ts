import * as bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
  roleName: string;
  phone: string;
  designation: string;
  isActive: boolean;
  managerId: string | null;
  teamLeadId: string | null;
  createdAt: string;
  avatar?: string;
}

const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

export const USERS_SEED: User[] = [
  {
    id: 'usr_admin',
    name: 'Admin User',
    email: 'admin@aadhansolar.com',
    passwordHash: hash('Admin@123'),
    roleId: 'role_admin',
    roleName: 'admin',
    phone: '9000000001',
    designation: 'System Administrator',
    isActive: true,
    managerId: null,
    teamLeadId: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'usr_manager',
    name: 'Ravi Kumar',
    email: 'manager@aadhansolar.com',
    passwordHash: hash('Manager@123'),
    roleId: 'role_manager',
    roleName: 'manager',
    phone: '9000000002',
    designation: 'Regional Manager',
    isActive: true,
    managerId: null,
    teamLeadId: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'usr_teamlead',
    name: 'Priya Singh',
    email: 'teamlead@aadhansolar.com',
    passwordHash: hash('Lead@123'),
    roleId: 'role_team_lead',
    roleName: 'team_lead',
    phone: '9000000003',
    designation: 'Team Lead',
    isActive: true,
    managerId: 'usr_manager',
    teamLeadId: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'usr_exec',
    name: 'Arjun Das',
    email: 'exec@aadhansolar.com',
    passwordHash: hash('Exec@123'),
    roleId: 'role_field_executive',
    roleName: 'field_executive',
    phone: '9000000004',
    designation: 'Field Executive',
    isActive: true,
    managerId: 'usr_manager',
    teamLeadId: 'usr_teamlead',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'usr_finance',
    name: 'Meena Sharma',
    email: 'finance@aadhansolar.com',
    passwordHash: hash('Finance@123'),
    roleId: 'role_finance_user',
    roleName: 'finance_user',
    phone: '9000000005',
    designation: 'Finance Executive',
    isActive: true,
    managerId: null,
    teamLeadId: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
];
