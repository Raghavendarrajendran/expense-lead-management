import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { CustomerFollowupsService } from './customer-followups.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/followups')
export class CustomerFollowupsController {
  constructor(private readonly service: CustomerFollowupsService) {}

  @Get()
  @RequirePermission('mod_ps_followups', 'view')
  findAll(@Query() query: any, @Request() req) { return this.service.findAll(query, req.user); }

  @Get(':id')
  @RequirePermission('mod_ps_followups', 'view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @RequirePermission('mod_ps_followups', 'create')
  create(@Body() dto: any, @Request() req) { return this.service.create(dto, req.user); }

  @Patch(':id')
  @RequirePermission('mod_ps_followups', 'edit')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }
}
