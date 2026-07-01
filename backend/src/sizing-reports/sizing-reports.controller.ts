import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { SizingReportsService } from './sizing-reports.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/sizing-reports')
export class SizingReportsController {
  constructor(private readonly service: SizingReportsService) {}

  @Get()
  @RequirePermission('mod_ps_sizing', 'view')
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @RequirePermission('mod_ps_sizing', 'view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @RequirePermission('mod_ps_sizing', 'create')
  create(@Body() dto: any, @Request() req) { return this.service.create(dto, req.user); }

  @Patch(':id')
  @RequirePermission('mod_ps_sizing', 'edit')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }
}
