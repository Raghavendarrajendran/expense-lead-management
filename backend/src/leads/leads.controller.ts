import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { LeadsService } from './leads.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @RequirePermission('mod_leads', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.leadsService.findAll(query, req.user);
  }

  @Get(':id')
  @RequirePermission('mod_leads', 'view')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @RequirePermission('mod_leads', 'create')
  create(@Body() dto: any, @Request() req) {
    return this.leadsService.create(dto, req.user);
  }

  @Patch(':id')
  @RequirePermission('mod_leads', 'edit')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('mod_leads', 'delete')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Post(':id/assign')
  @RequirePermission('mod_leads', 'assign')
  assign(@Param('id') id: string, @Body() dto: any) {
    return this.leadsService.assign(id, dto);
  }

  @Post(':id/remarks')
  @RequirePermission('mod_leads', 'comment')
  addRemark(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.leadsService.addRemark(id, dto, req.user);
  }

  @Patch(':id/status')
  @RequirePermission('mod_leads', 'change_status')
  changeStatus(@Param('id') id: string, @Body() dto: any) {
    return this.leadsService.changeStatus(id, dto);
  }
}
