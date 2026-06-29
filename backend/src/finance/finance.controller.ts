import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { FinanceService } from './finance.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get()
  @RequirePermission('mod_finance', 'view')
  getQueue() {
    return this.service.getQueue();
  }

  @Post(':id/verify')
  @RequirePermission('mod_finance', 'verify')
  verify(@Param('id') id: string, @Request() req) {
    return this.service.verify(id, req.user);
  }

  @Post(':id/reject')
  @RequirePermission('mod_finance', 'reject')
  reject(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.reject(id, dto, req.user);
  }

  @Post(':id/mark-paid')
  @RequirePermission('mod_finance', 'mark_as_paid')
  markAsPaid(@Param('id') id: string, @Request() req) {
    return this.service.markAsPaid(id, req.user);
  }
}
