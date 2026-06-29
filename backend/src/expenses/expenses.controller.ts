import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { ExpensesService } from './expenses.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get()
  @RequirePermission('mod_expenses', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.service.findAll(query, req.user);
  }

  @Get('limits-progress')
  @RequirePermission('mod_expenses', 'view')
  getLimitsProgress(@Request() req) {
    return this.service.getLimitsProgress(req.user);
  }

  @Get(':id')
  @RequirePermission('mod_expenses', 'view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('mod_expenses', 'create')
  create(@Body() dto: any, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  @RequirePermission('mod_expenses', 'edit')
  update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.update(id, dto, req.user);
  }

  @Post(':id/submit')
  @RequirePermission('mod_expenses', 'create')
  submit(@Param('id') id: string, @Request() req) {
    return this.service.submit(id, req.user);
  }
}
