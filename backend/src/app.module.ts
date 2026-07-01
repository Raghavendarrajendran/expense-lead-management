import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { LeadsModule } from './leads/leads.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { FinanceModule } from './finance/finance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ZohoModule } from './zoho/zoho.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';

// Pre-Sales Modules
import { PresalesLeadsModule } from './presales-leads/presales-leads.module';
import { SiteInspectionRequestsModule } from './site-inspection-requests/site-inspection-requests.module';
import { EngineeringSurveysModule } from './engineering-surveys/engineering-surveys.module';
import { ArrayLayoutsModule } from './array-layouts/array-layouts.module';
import { SizingReportsModule } from './sizing-reports/sizing-reports.module';
import { BomModule } from './bom/bom.module';
import { CostEstimationModule } from './cost-estimation/cost-estimation.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ProposalApprovalsModule } from './proposal-approvals/proposal-approvals.module';
import { ProposalRevisionsModule } from './proposal-revisions/proposal-revisions.module';
import { CustomerFollowupsModule } from './customer-followups/customer-followups.module';
import { OrdersModule } from './orders/orders.module';
import { AdvancePaymentsModule } from './advance-payments/advance-payments.module';
import { ChangeRequestsModule } from './change-requests/change-requests.module';
import { PresalesDocumentsModule } from './presales-documents/presales-documents.module';
import { MastersModule } from './masters/masters.module';

@Module({
  imports: [
    EmailModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    LeadsModule,
    SiteVisitsModule,
    ExpensesModule,
    ApprovalsModule,
    FinanceModule,
    DashboardModule,
    ReportsModule,
    ZohoModule,
    
    // Pre-Sales Modules
    PresalesLeadsModule,
    SiteInspectionRequestsModule,
    EngineeringSurveysModule,
    ArrayLayoutsModule,
    SizingReportsModule,
    BomModule,
    CostEstimationModule,
    ProposalsModule,
    ProposalApprovalsModule,
    ProposalRevisionsModule,
    CustomerFollowupsModule,
    OrdersModule,
    AdvancePaymentsModule,
    ChangeRequestsModule,
    PresalesDocumentsModule,
    MastersModule,
  ],
})
export class AppModule {}

