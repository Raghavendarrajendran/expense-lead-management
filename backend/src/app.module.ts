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

@Module({
  imports: [
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
  ],
})
export class AppModule {}
