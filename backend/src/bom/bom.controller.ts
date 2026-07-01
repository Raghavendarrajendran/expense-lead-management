import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { BomService } from './bom.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/bom')
export class BomController {
  constructor(private readonly service: BomService) {}

  @Get()
  @RequirePermission('mod_ps_bom', 'view')
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @RequirePermission('mod_ps_bom', 'view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @RequirePermission('mod_ps_bom', 'create')
  create(@Body() dto: any, @Request() req) { return this.service.create(dto, req.user); }

  @Patch(':id')
  @RequirePermission('mod_ps_bom', 'edit')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }
}
