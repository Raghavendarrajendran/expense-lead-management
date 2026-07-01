import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { AdvancePaymentsService } from './advance-payments.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/payments')
export class AdvancePaymentsController {
  constructor(private readonly service: AdvancePaymentsService) {}

  @Get()
  @RequirePermission('mod_ps_payments', 'view')
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @RequirePermission('mod_ps_payments', 'view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @RequirePermission('mod_ps_payments', 'create')
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @RequirePermission('mod_ps_payments', 'edit')
  update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.update(id, dto, req.user);
  }
}
