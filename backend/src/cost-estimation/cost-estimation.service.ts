import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class CostEstimationService {
  constructor(private readonly store: InMemoryStore) {}

  private calculateTotals(dto: any) {
    const subTotal = (dto.materialCost || 0) + (dto.labourCost || 0) +
      (dto.transportationCost || 0) + (dto.civilCost || 0) +
      (dto.installationCost || 0) + (dto.overheadCost || 0);
    const marginAmount = subTotal * ((dto.marginPercentage || 0) / 100);
    const totalBeforeTax = subTotal + marginAmount;
    const taxAmount = totalBeforeTax * ((dto.taxPercentage || 0) / 100);
    const finalProjectCost = totalBeforeTax + taxAmount;
    return { subTotal, marginAmount, totalBeforeTax, taxAmount, finalProjectCost };
  }

  findAll(query: any) {
    let items = this.store.getCostEstimations();
    if (query.leadId) items = items.filter(c => c.leadId === query.leadId);
    return items;
  }

  findOne(id: string) {
    const item = this.store.getCostEstimationById(id);
    if (!item) throw new NotFoundException(`Cost estimation ${id} not found`);
    return item;
  }

  create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    const calcs = this.calculateTotals(dto);
    return this.store.createCostEstimation({
      ...dto,
      ...calcs,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      createdBy: user.sub,
      createdByName: user.name || user.email,
    });
  }

  update(id: string, dto: any) {
    const existing = this.store.getCostEstimationById(id);
    if (!existing) throw new NotFoundException(`Cost estimation ${id} not found`);
    const merged = { ...existing, ...dto };
    const calcs = this.calculateTotals(merged);
    const est = this.store.updateCostEstimation(id, { ...dto, ...calcs });
    return est;
  }
}
