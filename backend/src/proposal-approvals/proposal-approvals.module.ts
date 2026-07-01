import { Module } from '@nestjs/common';
import { ProposalApprovalsController } from './proposal-approvals.controller';
import { ProposalApprovalsService } from './proposal-approvals.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [ProposalApprovalsController],
  providers: [ProposalApprovalsService, InMemoryStore],
  exports: [ProposalApprovalsService],
})
export class ProposalApprovalsModule {}
