import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { RolesService } from './roles.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @RequirePermission('mod_roles', 'view')
  findAll() { return this.service.findAll(); }

  @Get('modules')
  @RequirePermission('mod_roles', 'view')
  getModules() { return this.service.getModules(); }

  @Get('limits')
  @RequirePermission('mod_roles', 'view')
  getLimits() { return this.service.getLimits(); }

  @Get(':id/limits')
  @RequirePermission('mod_roles', 'view')
  getLimit(@Param('id') id: string) { return this.service.getLimit(id); }

  @Put(':id/limits')
  @RequirePermission('mod_roles', 'edit')
  updateLimit(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateLimit(id, dto);
  }

  @Get(':id')
  @RequirePermission('mod_roles', 'view')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @RequirePermission('mod_roles', 'create')
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @RequirePermission('mod_roles', 'edit')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  @RequirePermission('mod_roles', 'delete')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Get(':id/permissions')
  @RequirePermission('mod_roles', 'view')
  getPermissions(@Param('id') id: string) { return this.service.getPermissions(id); }

  @Put(':id/permissions')
  @RequirePermission('mod_roles', 'edit')
  setPermissions(@Param('id') id: string, @Body() dto: any) {
    return this.service.setPermissions(id, dto.permissions);
  }
}
