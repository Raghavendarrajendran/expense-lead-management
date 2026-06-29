import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { SiteVisitsService } from './site-visits.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('site-visits')
export class SiteVisitsController {
  constructor(private readonly service: SiteVisitsService) {}

  @Get()
  @RequirePermission('mod_site_visits', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.service.findAll(query, req.user);
  }

  @Get(':id')
  @RequirePermission('mod_site_visits', 'view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('mod_site_visits', 'create')
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermission('mod_site_visits', 'edit')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }
}
