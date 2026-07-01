import { Module } from '@nestjs/common';
import { ArrayLayoutsController } from './array-layouts.controller';
import { ArrayLayoutsService } from './array-layouts.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ArrayLayoutsController],
  providers: [ArrayLayoutsService, InMemoryStore],
  exports: [ArrayLayoutsService],
})
export class ArrayLayoutsModule {}
