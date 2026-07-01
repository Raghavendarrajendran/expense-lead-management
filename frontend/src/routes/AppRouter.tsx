import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { Login } from '../pages/auth/Login';
import { AccessDenied } from '../pages/auth/AccessDenied';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { LeadList } from '../pages/leads/LeadList';
import { LeadDetail } from '../pages/leads/LeadDetail';
import { CreateLead } from '../pages/leads/CreateLead';
import { EditLead } from '../pages/leads/EditLead';
import { SiteVisitList } from '../pages/site-visits/SiteVisitList';
import { SiteVisitDetail } from '../pages/site-visits/SiteVisitDetail';
import { ScheduleVisit } from '../pages/site-visits/ScheduleVisit';
import { ExpenseList } from '../pages/expenses/ExpenseList';
import { SubmitExpense } from '../pages/expenses/SubmitExpense';
import { ExpenseDetail } from '../pages/expenses/ExpenseDetail';
import { ApprovalQueue } from '../pages/approvals/ApprovalQueue';
import { FinanceQueue } from '../pages/finance/FinanceQueue';
import { LeadReports } from '../pages/reports/LeadReports';
import { ExpenseReports } from '../pages/reports/ExpenseReports';
import { UserList } from '../pages/users/UserList';
import { CreateUser } from '../pages/users/CreateUser';
import { EditUser } from '../pages/users/EditUser';
import { RoleList } from '../pages/roles/RoleList';
import { PermissionMatrix } from '../pages/roles/PermissionMatrix';
import { Settings } from '../pages/settings/Settings';
import { NotificationsList } from '../pages/notifications/NotificationsList';
import { AnnouncementForm } from '../pages/notifications/AnnouncementForm';
import { MasterManagement } from '../pages/admin/MasterManagement';

// Pre-Sales Pages
import { PreSalesDashboard } from '../pages/presales/PreSalesDashboard';
import { LeadQualList } from '../pages/presales/lead-qualification/LeadQualList';
import { LeadQualForm } from '../pages/presales/lead-qualification/LeadQualForm';
import { LeadQualDetail } from '../pages/presales/lead-qualification/LeadQualDetail';
import { InspectionList } from '../pages/presales/site-inspections/InspectionList';
import { InspectionForm } from '../pages/presales/site-inspections/InspectionForm';
import { InspectionDetail } from '../pages/presales/site-inspections/InspectionDetail';
import { SurveyForm } from '../pages/presales/engineering-surveys/SurveyForm';
import { SurveyList } from '../pages/presales/engineering-surveys/SurveyList';
import { ArrayLayoutForm } from '../pages/presales/array-layouts/ArrayLayoutForm';
import { ArrayLayoutList } from '../pages/presales/array-layouts/ArrayLayoutList';
import { SizingReportForm } from '../pages/presales/sizing-reports/SizingReportForm';
import { SizingReportList } from '../pages/presales/sizing-reports/SizingReportList';
import { BomForm } from '../pages/presales/bom/BomForm';
import { BomList } from '../pages/presales/bom/BomList';
import { CostEstForm } from '../pages/presales/cost-estimation/CostEstForm';
import { CostEstList } from '../pages/presales/cost-estimation/CostEstList';
import { ProposalForm } from '../pages/presales/proposals/ProposalForm';
import { ProposalDetail } from '../pages/presales/proposals/ProposalDetail';
import { ProposalList } from '../pages/presales/proposals/ProposalList';
import { ProposalApprovalQueue } from '../pages/presales/approvals/ProposalApprovalQueue';
import { RevisionHistory } from '../pages/presales/revisions/RevisionHistory';
import { FollowupList } from '../pages/presales/followups/FollowupList';
import { FollowupForm } from '../pages/presales/followups/FollowupForm';
import { OrderList } from '../pages/presales/orders/OrderList';
import { OrderForm } from '../pages/presales/orders/OrderForm';
import { PaymentList } from '../pages/presales/payments/PaymentList';
import { ChangeRequestList } from '../pages/presales/change-requests/ChangeRequestList';
import { ChangeRequestForm } from '../pages/presales/change-requests/ChangeRequestForm';
import { DocumentList } from '../pages/presales/documents/DocumentList';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />

            {/* Leads */}
            <Route path="/leads" element={<AppLayout><LeadList /></AppLayout>} />
            <Route path="/leads/new" element={<AppLayout><CreateLead /></AppLayout>} />
            <Route path="/leads/:id" element={<AppLayout><LeadDetail /></AppLayout>} />
            <Route path="/leads/:id/edit" element={<AppLayout><EditLead /></AppLayout>} />

            {/* Site Visits */}
            <Route path="/site-visits" element={<AppLayout><SiteVisitList /></AppLayout>} />
            <Route path="/site-visits/new" element={<AppLayout><ScheduleVisit /></AppLayout>} />
            <Route path="/site-visits/:id" element={<AppLayout><SiteVisitDetail /></AppLayout>} />

            {/* Expenses */}
            <Route path="/expenses" element={<AppLayout><ExpenseList /></AppLayout>} />
            <Route path="/expenses/new" element={<AppLayout><SubmitExpense /></AppLayout>} />
            <Route path="/expenses/:id" element={<AppLayout><ExpenseDetail /></AppLayout>} />

            {/* Approvals */}
            <Route path="/approvals" element={<AppLayout><ApprovalQueue /></AppLayout>} />

            {/* Finance */}
            <Route path="/finance" element={<AppLayout><FinanceQueue /></AppLayout>} />

            {/* Reports tab layout */}
            <Route path="/reports" element={<AppLayout><LeadReports /></AppLayout>} />
            <Route path="/reports/leads" element={<AppLayout><LeadReports /></AppLayout>} />
            <Route path="/reports/expenses" element={<AppLayout><ExpenseReports /></AppLayout>} />

            {/* User Management */}
            <Route path="/users" element={<AppLayout><UserList /></AppLayout>} />
            <Route path="/users/new" element={<AppLayout><CreateUser /></AppLayout>} />
            <Route path="/users/:id/edit" element={<AppLayout><EditUser /></AppLayout>} />

            {/* Role Management */}
            <Route path="/roles" element={<AppLayout><RoleList /></AppLayout>} />
            <Route path="/roles/:id/permissions" element={<AppLayout><PermissionMatrix /></AppLayout>} />

            {/* Settings */}
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

            {/* Notifications */}
            <Route path="/notifications" element={<AppLayout><NotificationsList /></AppLayout>} />
            <Route path="/notifications/announce" element={<AppLayout><AnnouncementForm /></AppLayout>} />
            <Route path="/masters" element={<AppLayout><MasterManagement /></AppLayout>} />

            {/* Pre-Sales CRM Modules */}
            <Route path="/presales/dashboard" element={<AppLayout><PreSalesDashboard /></AppLayout>} />
            <Route path="/presales/leads" element={<AppLayout><LeadQualList /></AppLayout>} />
            <Route path="/presales/leads/new" element={<AppLayout><LeadQualForm /></AppLayout>} />
            <Route path="/presales/leads/:id" element={<AppLayout><LeadQualDetail /></AppLayout>} />
            <Route path="/presales/leads/:id/edit" element={<AppLayout><LeadQualForm /></AppLayout>} />
            <Route path="/presales/inspection-requests" element={<AppLayout><InspectionList /></AppLayout>} />
            <Route path="/presales/inspection-requests/new" element={<AppLayout><InspectionForm /></AppLayout>} />
            <Route path="/presales/inspection-requests/:id" element={<AppLayout><InspectionDetail /></AppLayout>} />
            <Route path="/presales/inspection-requests/:id/edit" element={<AppLayout><InspectionForm /></AppLayout>} />
            <Route path="/presales/engineering-surveys" element={<AppLayout><SurveyList /></AppLayout>} />
            <Route path="/presales/engineering-surveys/new" element={<AppLayout><SurveyForm /></AppLayout>} />
            <Route path="/presales/array-layouts" element={<AppLayout><ArrayLayoutList /></AppLayout>} />
            <Route path="/presales/array-layouts/new" element={<AppLayout><ArrayLayoutForm /></AppLayout>} />
            <Route path="/presales/sizing-reports" element={<AppLayout><SizingReportList /></AppLayout>} />
            <Route path="/presales/sizing-reports/new" element={<AppLayout><SizingReportForm /></AppLayout>} />
            <Route path="/presales/bom" element={<AppLayout><BomList /></AppLayout>} />
            <Route path="/presales/bom/new" element={<AppLayout><BomForm /></AppLayout>} />
            <Route path="/presales/costing" element={<AppLayout><CostEstList /></AppLayout>} />
            <Route path="/presales/costing/new" element={<AppLayout><CostEstForm /></AppLayout>} />
            <Route path="/presales/proposals" element={<AppLayout><ProposalList /></AppLayout>} />
            <Route path="/presales/proposals/new" element={<AppLayout><ProposalForm /></AppLayout>} />
            <Route path="/presales/proposals/:id" element={<AppLayout><ProposalDetail /></AppLayout>} />
            <Route path="/presales/proposal-approvals" element={<AppLayout><ProposalApprovalQueue /></AppLayout>} />
            <Route path="/presales/revisions" element={<AppLayout><RevisionHistory /></AppLayout>} />
            <Route path="/presales/followups" element={<AppLayout><FollowupList /></AppLayout>} />
            <Route path="/presales/followups/new" element={<AppLayout><FollowupForm /></AppLayout>} />
            <Route path="/presales/orders" element={<AppLayout><OrderList /></AppLayout>} />
            <Route path="/presales/orders/new" element={<AppLayout><OrderForm /></AppLayout>} />
            <Route path="/presales/payments" element={<AppLayout><PaymentList /></AppLayout>} />
            <Route path="/presales/change-requests" element={<AppLayout><ChangeRequestList /></AppLayout>} />
            <Route path="/presales/change-requests/new" element={<AppLayout><ChangeRequestForm /></AppLayout>} />
            <Route path="/presales/documents" element={<AppLayout><DocumentList /></AppLayout>} />

            <Route path="/access-denied" element={<AccessDenied />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default AppRouter;
