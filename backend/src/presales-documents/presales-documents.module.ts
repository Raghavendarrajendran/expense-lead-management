import { Module } from '@nestjs/common';
import { PresalesDocumentsController } from './presales-documents.controller';
import { PresalesDocumentsService } from './presales-documents.service';
import { InMemoryStore } from '../store/in-memory.store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PresalesDocumentsController],
  providers: [PresalesDocumentsService, InMemoryStore],
  exports: [PresalesDocumentsService],
})
export class PresalesDocumentsModule {}
