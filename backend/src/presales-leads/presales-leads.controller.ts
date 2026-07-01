import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { PresalesLeadsService } from './presales-leads.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/leads')
export class PresalesLeadsController {
  constructor(private readonly service: PresalesLeadsService) {}

  @Get()
  @RequirePermission('mod_ps_leads', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.service.findAll(query, req.user);
  }

  @Get(':id')
  @RequirePermission('mod_ps_leads', 'view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('mod_ps_leads', 'create')
  create(@Body() dto: any, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  @RequirePermission('mod_ps_leads', 'edit')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('mod_ps_leads', 'delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/qualify')
  @RequirePermission('mod_ps_leads', 'qualify')
  qualify(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.qualify(id, dto, req.user);
  }

  @Post(':id/assign')
  @RequirePermission('mod_ps_leads', 'assign')
  assign(@Param('id') id: string, @Body() dto: any) {
    return this.service.assign(id, dto);
  }
}
