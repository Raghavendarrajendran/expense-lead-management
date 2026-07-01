import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermission } from '../common/decorators/permissions.decorator';
import { ProposalRevisionsService } from './proposal-revisions.service';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('presales/proposal-revisions')
export class ProposalRevisionsController {
  constructor(private readonly service: ProposalRevisionsService) {}

  @Get()
  @RequirePermission('mod_ps_revisions', 'view')
  findAll(@Query() query: any) {
    if (query.proposalId) return this.service.findByProposal(query.proposalId);
    return this.service.findAll();
  }

  @Get(':proposalId')
  @RequirePermission('mod_ps_revisions', 'view')
  findByProposal(@Param('proposalId') proposalId: string) {
    return this.service.findByProposal(proposalId);
  }

  @Post()
  @RequirePermission('mod_ps_revisions', 'create')
  create(@Body() dto: any, @Request() req) { return this.service.create(dto, req.user); }
}
