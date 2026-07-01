import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { SiteInspectionRequestsService } from './site-inspection-requests.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/site-inspections')
export class SiteInspectionRequestsController {
  constructor(private readonly service: SiteInspectionRequestsService) {}

  @Get()
  @RequirePermission('mod_ps_inspection_req', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.service.findAll(query, req.user);
  }

  @Get(':id')
  @RequirePermission('mod_ps_inspection_req', 'view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('mod_ps_inspection_req', 'request_inspection')
  create(@Body() dto: any, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  @RequirePermission('mod_ps_inspection_req', 'change_status')
  update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @RequirePermission('mod_ps_inspection_req', 'delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
