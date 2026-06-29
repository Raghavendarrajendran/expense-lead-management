import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any) {
    let users = this.store.getUsers();
    if (query.roleId) users = users.filter(u => u.roleId === query.roleId);
    if (query.isActive !== undefined) users = users.filter(u => u.isActive === (query.isActive === 'true'));
    // Never return passwordHash
    return users.map(({ passwordHash, ...u }) => u);
  }

  findOne(id: string) {
    const user = this.store.getUserById(id);
    if (!user) return null;
    const { passwordHash, ...u } = user;
    return u;
  }

  async create(dto: any) {
    const passwordHash = await bcrypt.hash(dto.password || 'Password@123', 10);
    const role = this.store.getRoleById(dto.roleId);
    const user = this.store.createUser({ ...dto, passwordHash, roleName: role?.name || dto.roleId });
    const { passwordHash: _, ...u } = user;
    return u;
  }

  async update(id: string, dto: any) {
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }
    const user = this.store.updateUser(id, data);
    if (!user) return null;
    const { passwordHash, ...u } = user;
    return u;
  }

  remove(id: string) {
    return this.store.deleteUser(id);
  }

  assignRole(userId: string, roleId: string) {
    const role = this.store.getRoleById(roleId);
    return this.store.updateUser(userId, { roleId, roleName: role?.name || roleId });
  }

  mapHierarchy(dto: { userId: string; managerId?: string; teamLeadId?: string }) {
    return this.store.updateUser(dto.userId, {
      managerId: dto.managerId || null,
      teamLeadId: dto.teamLeadId || null,
    });
  }
}
