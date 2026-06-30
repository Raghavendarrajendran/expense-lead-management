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

            <Route path="/access-denied" element={<AccessDenied />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default AppRouter;
