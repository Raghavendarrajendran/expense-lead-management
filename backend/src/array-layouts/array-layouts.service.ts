import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class ArrayLayoutsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any) {
    let layouts = this.store.getArrayLayouts();
    if (query.leadId) layouts = layouts.filter(l => l.leadId === query.leadId);
    if (query.designStatus) layouts = layouts.filter(l => l.designStatus === query.designStatus);
    return layouts;
  }

  findOne(id: string) {
    const layout = this.store.getArrayLayoutById(id);
    if (!layout) throw new NotFoundException(`Array layout ${id} not found`);
    return layout;
  }

  create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    return this.store.createArrayLayout({
      ...dto,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      designStatus: 'Draft',
      createdBy: user.sub,
      createdByName: user.name || user.email,
    });
  }

  update(id: string, dto: any) {
    const layout = this.store.updateArrayLayout(id, dto);
    if (!layout) throw new NotFoundException(`Array layout ${id} not found`);
    return layout;
  }
}
