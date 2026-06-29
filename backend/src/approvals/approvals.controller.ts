import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { ApprovalsService } from './approvals.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  @Get()
  @RequirePermission('mod_approvals', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.service.findAll(query, req.user);
  }

  @Get(':id')
  @RequirePermission('mod_approvals', 'view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/history')
  @RequirePermission('mod_approvals', 'view')
  getHistory(@Param('id') id: string) {
    return this.service.getHistory(id);
  }

  @Post(':id/approve')
  @RequirePermission('mod_approvals', 'approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user);
  }

  @Post(':id/reject')
  @RequirePermission('mod_approvals', 'reject')
  reject(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.reject(id, dto, req.user);
  }
}
