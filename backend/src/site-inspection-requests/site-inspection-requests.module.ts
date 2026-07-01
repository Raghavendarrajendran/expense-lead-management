import { Module } from '@nestjs/common';
import { SiteInspectionRequestsController } from './site-inspection-requests.controller';
import { SiteInspectionRequestsService } from './site-inspection-requests.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [SiteInspectionRequestsController],
  providers: [SiteInspectionRequestsService, InMemoryStore],
  exports: [SiteInspectionRequestsService],
})
export class SiteInspectionRequestsModule {}
