import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class SizingReportsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any) {
    let reports = this.store.getSizingReports();
    if (query.leadId) reports = reports.filter(r => r.leadId === query.leadId);
    return reports;
  }

  findOne(id: string) {
    const report = this.store.getSizingReportById(id);
    if (!report) throw new NotFoundException(`Sizing report ${id} not found`);
    return report;
  }

  create(dto: any, user: any) {
    const lead = this.store.getPresalesLeadById(dto.leadId);
    return this.store.createSizingReport({
      ...dto,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      generatedBy: user.sub,
      generatedByName: user.name || user.email,
    });
  }

  update(id: string, dto: any) {
    const report = this.store.updateSizingReport(id, dto);
    if (!report) throw new NotFoundException(`Sizing report ${id} not found`);
    return report;
  }
}
