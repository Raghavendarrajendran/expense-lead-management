import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class CustomerFollowupsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any, user: any) {
    let followups = this.store.getCustomerFollowups();
    if (user.roleName === 'sales_executive') {
      followups = followups.filter(f => f.createdBy === user.sub);
    }
    if (query.leadId) followups = followups.filter(f => f.leadId === query.leadId);
    if (query.proposalId) followups = followups.filter(f => f.proposalId === query.proposalId);
    if (query.status) followups = followups.filter(f => f.status === query.status);
    return followups;
  }

  findOne(id: string) {
    const followup = this.store.getCustomerFollowupById(id);
    if (!followup) throw new NotFoundException(`Follow-up ${id} not found`);
    return followup;
  }

  create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    return this.store.createCustomerFollowup({
      ...dto,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      status: dto.status || 'Open',
      createdBy: user.sub,
      createdByName: user.name || user.email,
    });
  }

  update(id: string, dto: any) {
    const followup = this.store.updateCustomerFollowup(id, dto);
    if (!followup) throw new NotFoundException(`Follow-up ${id} not found`);
    return followup;
  }
}
