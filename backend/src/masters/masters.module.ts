import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InMemoryStore } from '../store/in-memory.store';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';

@Module({
  imports: [AuthModule],
  controllers: [MastersController],
  providers: [MastersService, InMemoryStore],
  exports: [MastersService],
})
export class MastersModule {}
