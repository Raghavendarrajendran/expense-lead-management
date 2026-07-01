import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class ProposalRevisionsService {
  constructor(private readonly store: InMemoryStore) {}

  findByProposal(proposalId: string) {
    return this.store.getProposalRevisionsByProposalId(proposalId);
  }

  findAll() {
    return this.store.getProposalRevisions();
  }

  create(dto: any, user: any) {
    const proposal = this.store.getProposalById(dto.proposalId);
    if (!proposal) throw new NotFoundException(`Proposal ${dto.proposalId} not found`);

    const existing = this.store.getProposalRevisionsByProposalId(dto.proposalId);
    const version = existing.length > 0 ? Math.max(...existing.map(r => r.version)) + 1 : 1;

    // Bump proposal version and mark as draft
    this.store.updateProposal(dto.proposalId, {
      version: proposal.version + 1,
      proposalStatus: 'Draft',
    });

    return this.store.createProposalRevision({
      ...dto,
      version,
      revisedBy: user.sub,
      revisedByName: user.name || user.email,
      revisedDate: new Date().toISOString(),
    });
  }
}
