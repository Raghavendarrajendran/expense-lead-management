import { Module } from '@nestjs/common';
import { CustomerFollowupsController } from './customer-followups.controller';
import { CustomerFollowupsService } from './customer-followups.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CustomerFollowupsController],
  providers: [CustomerFollowupsService, InMemoryStore],
  exports: [CustomerFollowupsService],
})
export class CustomerFollowupsModule {}
