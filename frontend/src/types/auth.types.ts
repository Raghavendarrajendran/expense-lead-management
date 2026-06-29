export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  role: { id: string; name: string; displayName: string };
}

export interface PermissionEntry {
  moduleId: string;
  moduleName: string;
  actions: string[];
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  permissions: PermissionEntry[];
  menu: MenuItem[];
  isAuthenticated: boolean;
  isLoading: boolean;
}
