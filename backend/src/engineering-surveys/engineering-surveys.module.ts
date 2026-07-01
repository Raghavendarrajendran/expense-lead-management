import { Module } from '@nestjs/common';
import { EngineeringSurveysController } from './engineering-surveys.controller';
import { EngineeringSurveysService } from './engineering-surveys.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [EngineeringSurveysController],
  providers: [EngineeringSurveysService, InMemoryStore],
  exports: [EngineeringSurveysService],
})
export class EngineeringSurveysModule {}
