import { Module } from '@nestjs/common';
import { AdvancePaymentsController } from './advance-payments.controller';
import { AdvancePaymentsService } from './advance-payments.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [AdvancePaymentsController],
  providers: [AdvancePaymentsService, InMemoryStore],
  exports: [AdvancePaymentsService],
})
export class AdvancePaymentsModule {}
