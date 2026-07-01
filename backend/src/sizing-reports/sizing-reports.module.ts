import { Module } from '@nestjs/common';
import { SizingReportsController } from './sizing-reports.controller';
import { SizingReportsService } from './sizing-reports.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SizingReportsController],
  providers: [SizingReportsService, InMemoryStore],
  exports: [SizingReportsService],
})
export class SizingReportsModule {}
