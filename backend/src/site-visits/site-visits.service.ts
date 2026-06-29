import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class SiteVisitsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(query: any, user: any) {
    let visits = this.store.getSiteVisits();
    if (user.roleName === 'field_executive') {
      visits = visits.filter(v => v.assignedExecutiveId === user.sub);
    }
    if (query.status) visits = visits.filter(v => v.status === query.status);
    if (query.leadId) visits = visits.filter(v => v.leadId === query.leadId);
    if (query.executiveId) visits = visits.filter(v => v.assignedExecutiveId === query.executiveId);
    return visits;
  }

  findOne(id: string) {
    const visit = this.store.getSiteVisitById(id);
    if (!visit) throw new NotFoundException(`Site visit ${id} not found`);
    return visit;
  }

  create(dto: any) {
    return this.store.createSiteVisit({ ...dto, status: 'Scheduled', photos: [] });
  }

  update(id: string, dto: any) {
    const visit = this.store.updateSiteVisit(id, dto);
    if (!visit) throw new NotFoundException(`Site visit ${id} not found`);
    return visit;
  }

  addPhoto(id: string, photoUrl: string) {
    const visit = this.store.getSiteVisitById(id);
    if (!visit) throw new NotFoundException(`Site visit ${id} not found`);
    const photos = [...visit.photos, photoUrl];
    return this.store.updateSiteVisit(id, { photos });
  }
}
