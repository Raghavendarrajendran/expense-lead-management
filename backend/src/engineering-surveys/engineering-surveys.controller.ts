import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { EngineeringSurveysService } from './engineering-surveys.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/engineering-surveys')
export class EngineeringSurveysController {
  constructor(private readonly service: EngineeringSurveysService) {}

  @Get()
  @RequirePermission('mod_ps_engineering', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.service.findAll(query, req.user);
  }

  @Get(':id')
  @RequirePermission('mod_ps_engineering', 'view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('mod_ps_engineering', 'perform_inspection')
  create(@Body() dto: any, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  @RequirePermission('mod_ps_engineering', 'edit')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }
}
