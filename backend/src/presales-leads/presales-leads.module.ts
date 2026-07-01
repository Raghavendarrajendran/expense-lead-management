import { Module } from '@nestjs/common';
import { PresalesLeadsController } from './presales-leads.controller';
import { PresalesLeadsService } from './presales-leads.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [PresalesLeadsController],
  providers: [PresalesLeadsService, InMemoryStore],
  exports: [PresalesLeadsService],
})
export class PresalesLeadsModule {}
