import { Module } from '@nestjs/common';
import { SiteVisitsController } from './site-visits.controller';
import { SiteVisitsService } from './site-visits.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService, InMemoryStore],
})
export class SiteVisitsModule {}
