import { Module } from '@nestjs/common';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, InMemoryStore],
})
export class ApprovalsModule {}

