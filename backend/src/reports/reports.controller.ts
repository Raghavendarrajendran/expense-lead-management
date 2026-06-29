import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('leads')
  @RequirePermission('mod_reports', 'view')
  getLeadReports(@Query() query: any) {
    return this.service.getLeadReports(query);
  }

  @Get('expenses')
  @RequirePermission('mod_reports', 'view')
  getExpenseReports(@Query() query: any) {
    return this.service.getExpenseReports(query);
  }
}
