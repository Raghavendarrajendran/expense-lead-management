import { Module } from '@nestjs/common';
import { ProposalRevisionsController } from './proposal-revisions.controller';
import { ProposalRevisionsService } from './proposal-revisions.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProposalRevisionsController],
  providers: [ProposalRevisionsService, InMemoryStore],
  exports: [ProposalRevisionsService],
})
export class ProposalRevisionsModule {}
