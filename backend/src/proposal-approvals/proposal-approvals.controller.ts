import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { ProposalApprovalsService } from './proposal-approvals.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/proposal-approvals')
export class ProposalApprovalsController {
  constructor(private readonly service: ProposalApprovalsService) {}

  @Get()
  @RequirePermission('mod_ps_approvals', 'view')
  findAll(@Query() query: any, @Request() req) {
    return this.service.findAll(query, req.user);
  }

  @Get('by-proposal/:proposalId')
  @RequirePermission('mod_ps_approvals', 'view')
  getByProposal(@Param('proposalId') proposalId: string) {
    return this.service.getByProposal(proposalId);
  }

  @Post(':id/approve')
  @RequirePermission('mod_ps_approvals', 'approve')
  approve(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.approve(id, dto, req.user);
  }

  @Post(':id/reject')
  @RequirePermission('mod_ps_approvals', 'reject')
  reject(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.service.reject(id, dto, req.user);
  }
}
