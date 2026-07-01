import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { PresalesDocumentsService } from './presales-documents.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/documents')
export class PresalesDocumentsController {
  constructor(private readonly service: PresalesDocumentsService) {}

  @Get()
  @RequirePermission('mod_ps_documents', 'view')
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @RequirePermission('mod_ps_documents', 'view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @RequirePermission('mod_ps_documents', 'upload')
  create(@Body() dto: any, @Request() req) { return this.service.create(dto, req.user); }

  @Delete(':id')
  @RequirePermission('mod_ps_documents', 'delete')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
