import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { ChangeRequestsService } from './change-requests.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/change-requests')
export class ChangeRequestsController {
  constructor(private readonly service: ChangeRequestsService) {}

  @Get()
  @RequirePermission('mod_ps_change_requests', 'view')
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @RequirePermission('mod_ps_change_requests', 'view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @RequirePermission('mod_ps_change_requests', 'create')
  create(@Body() dto: any, @Request() req) { return this.service.create(dto, req.user); }

  @Patch(':id')
  @RequirePermission('mod_ps_change_requests', 'edit')
  update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.update(id, dto, req.user);
  }
}
