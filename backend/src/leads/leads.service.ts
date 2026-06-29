import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LeadsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any, user: any) {
    let leads = this.store.getLeads();

    // Scope: field executives see only assigned leads
    if (user.roleName === 'field_executive') {
      leads = leads.filter(l => l.assignedExecutiveId === user.sub);
    }
    // Scope: team_lead / manager see all (for POC)

    // Filters
    if (query.status) leads = leads.filter(l => l.status === query.status);
    if (query.source) leads = leads.filter(l => l.leadSource === query.source);
    if (query.executiveId) leads = leads.filter(l => l.assignedExecutiveId === query.executiveId);
    if (query.search) {
      const s = query.search.toLowerCase();
      leads = leads.filter(l =>
        l.customerName.toLowerCase().includes(s) ||
        l.mobile.includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.city.toLowerCase().includes(s),
      );
    }
    if (query.from) leads = leads.filter(l => l.createdAt >= query.from);
    if (query.to) leads = leads.filter(l => l.createdAt <= query.to);

    return leads;
  }

  findOne(id: string) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  create(dto: any, user: any) {
    // Duplicate mobile/email check
    const existing = this.store.getLeads().find(
      l => l.mobile === dto.mobile || l.email === dto.email,
    );
    if (existing) throw new BadRequestException('A lead with this mobile or email already exists');

    return this.store.createLead({
      ...dto,
      status: 'New',
      createdBy: user.sub,
      createdByName: dto.createdByName || 'Unknown',
      remarks: [],
    });
  }

  update(id: string, dto: any) {
    const lead = this.store.updateLead(id, dto);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  remove(id: string) {
    const deleted = this.store.deleteLead(id);
    if (!deleted) throw new NotFoundException(`Lead ${id} not found`);
    return { message: 'Lead deleted successfully' };
  }

  assign(id: string, dto: { executiveId: string; executiveName: string }) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return this.store.updateLead(id, {
      assignedExecutiveId: dto.executiveId,
      assignedExecutiveName: dto.executiveName,
      status: 'Assigned',
    });
  }

  addRemark(id: string, dto: { text: string }, user: any) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    const remark = {
      id: `rem_${uuidv4()}`,
      text: dto.text,
      addedBy: user.sub,
      addedByName: user.name || 'Unknown',
      createdAt: new Date().toISOString(),
    };
    const updatedRemarks = [...lead.remarks, remark];
    return this.store.updateLead(id, { remarks: updatedRemarks });
  }

  changeStatus(id: string, dto: { status: string }) {
    const lead = this.store.getLeadById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return this.store.updateLead(id, { status: dto.status as any });
  }
}
