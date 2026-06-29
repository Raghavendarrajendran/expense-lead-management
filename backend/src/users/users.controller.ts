import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @RequirePermission('mod_users', 'view')
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermission('mod_users', 'view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('mod_users', 'create')
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermission('mod_users', 'edit')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('mod_users', 'delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/assign-role')
  @RequirePermission('mod_users', 'assign')
  assignRole(@Param('id') id: string, @Body() dto: any) {
    return this.service.assignRole(id, dto.roleId);
  }

  @Post('map-hierarchy')
  @RequirePermission('mod_users', 'assign')
  mapHierarchy(@Body() dto: any) {
    return this.service.mapHierarchy(dto);
  }
}
