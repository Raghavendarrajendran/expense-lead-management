import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class PresalesDocumentsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any) {
    let docs = this.store.getPresalesDocuments();
    if (query.entityId) docs = docs.filter(d => d.entityId === query.entityId);
    if (query.leadId) docs = docs.filter(d => d.leadId === query.leadId);
    if (query.entityType) docs = docs.filter(d => d.entityType === query.entityType);
    if (query.documentCategory) docs = docs.filter(d => d.documentCategory === query.documentCategory);
    return docs;
  }

  findOne(id: string) {
    const doc = this.store.getPresalesDocumentById(id);
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  create(dto: any, user: any) {
    const lead = dto.leadId ? this.store.getPresalesLeadById(dto.leadId) : null;
    return this.store.createPresalesDocument({
      ...dto,
      customerName: lead?.customerName || dto.customerName || 'Unknown',
      uploadedBy: user.sub,
      uploadedByName: user.name || user.email,
    });
  }

  remove(id: string) {
    const deleted = this.store.deletePresalesDocument(id);
    if (!deleted) throw new NotFoundException(`Document ${id} not found`);
    return { message: 'Document deleted' };
  }
}
