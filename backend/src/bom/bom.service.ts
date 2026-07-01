import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BomService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any) {
    let boms = this.store.getBoms();
    if (query.leadId) boms = boms.filter(b => b.leadId === query.leadId);
    if (query.bomStatus) boms = boms.filter(b => b.bomStatus === query.bomStatus);
    return boms;
  }

  findOne(id: string) {
    const bom = this.store.getBomById(id);
    if (!bom) throw new NotFoundException(`BOM ${id} not found`);
    return bom;
  }

  create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    const lineItems = (dto.lineItems || []).map((item: any, idx: number) => ({
      id: `bi_${uuidv4()}`,
      ...item,
      totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
    }));
    const totalAmount = lineItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

    return this.store.createBom({
      ...dto,
      lineItems,
      totalAmount,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      bomStatus: 'Draft',
      createdBy: user.sub,
      createdByName: user.name || user.email,
    });
  }

  update(id: string, dto: any) {
    const existing = this.store.getBomById(id);
    if (!existing) throw new NotFoundException(`BOM ${id} not found`);

    let updateData: any = { ...dto };

    // Recalculate totals when line items provided
    if (dto.lineItems) {
      const lineItems = dto.lineItems.map((item: any) => ({
        id: item.id || `bi_${uuidv4()}`,
        ...item,
        totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
      }));
      const totalAmount = lineItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
      updateData = { ...updateData, lineItems, totalAmount };
    }

    const bom = this.store.updateBom(id, updateData);
    return bom;
  }
}
