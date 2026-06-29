import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class RolesService {
  constructor(private readonly store: InMemoryStore) {}

  findAll() { return this.store.getRoles(); }
  findOne(id: string) { return this.store.getRoleById(id); }
  create(dto: any) { return this.store.createRole(dto); }
  update(id: string, dto: any) { return this.store.updateRole(id, dto); }
  remove(id: string) { return this.store.deleteRole(id); }

  getPermissions(roleId: string) {
    const role = this.store.getRoleById(roleId);
    if (!role) return [];
    return this.store.getPermissionsForRole(role.name);
  }

  setPermissions(roleId: string, perms: any[]) {
    const role = this.store.getRoleById(roleId);
    if (!role) return null;
    this.store.setPermissionsForRole(role.name, perms);
    return this.store.getPermissionsForRole(role.name);
  }

  getModules() { return this.store.getModules(); }

  getLimits() { return this.store.getRoleLimits(); }
  getLimit(roleId: string) { return this.store.getRoleLimitByRoleId(roleId); }
  updateLimit(roleId: string, dto: any) { return this.store.updateRoleLimit(roleId, dto); }
}
