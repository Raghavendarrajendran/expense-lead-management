import { Module } from '@nestjs/common';
import { CostEstimationController } from './cost-estimation.controller';
import { CostEstimationService } from './cost-estimation.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CostEstimationController],
  providers: [CostEstimationService, InMemoryStore],
  exports: [CostEstimationService],
})
export class CostEstimationModule {}
