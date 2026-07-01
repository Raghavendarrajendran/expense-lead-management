import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { MastersService } from './masters.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get()
  getMasters() {
    return this.mastersService.getMasters();
  }

  @Put(':key')
  @RequirePermission('mod_masters', 'edit')
  updateMaster(@Param('key') key: string, @Body() body: { values: string[] }) {
    return this.mastersService.updateMaster(key, body.values || []);
  }
}
