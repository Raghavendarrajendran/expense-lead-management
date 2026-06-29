import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboard } from '../../api/dashboard.api';
import {
  Users, UserCheck, FolderKanban, Receipt, CheckCircle,
  TrendingUp, Award, Clock, FileText, Wallet, Calendar, AlertTriangle, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => {
        setStats(res.data.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!stats) {
    return <div className="card">Error loading dashboard data.</div>;
  }

  const role = user?.role?.name;

  // Process data for charts
  const leadsChartData = stats.leadsByStatus
    ? Object.keys(stats.leadsByStatus).map(status => ({
        name: status,
        value: stats.leadsByStatus[status],
      }))
    : [];

  const expensesChartData = stats.expensesByCategory
    ? Object.keys(stats.expensesByCategory).map(cat => ({
        name: cat,
        value: stats.expensesByCategory[cat],
      }))
    : [];

  const COLORS = ['#F97316', '#1E3A5F', '#FBBF24', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="dashboard animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Welcome, {user?.name}</h1>
          <p className="page-subtitle">Here is what is happening at Aadhan Solar today.</p>
        </div>
        <div className="page-actions">
          <span className="badge badge-scheduled" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Calendar size={14} style={{ marginRight: '6px' }} />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ─── ADMIN DASHBOARD ─── */}
      {role === 'admin' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Users size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Users</div>
                <div className="stat-card-value">{stats.totalUsers}</div>
                <div className="stat-card-sub">{stats.activeUsers} Active Users</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <FolderKanban size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Leads</div>
                <div className="stat-card-value">{stats.totalLeads}</div>
                <div className="stat-card-sub">Active pipeline</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <Receipt size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Expenses</div>
                <div className="stat-card-value">{stats.totalExpenses}</div>
                <div className="stat-card-sub">{stats.paidExpenses} Reimbursements Paid</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <Clock size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Approvals</div>
                <div className="stat-card-value">{stats.pendingApprovals}</div>
                <div className="stat-card-sub">Awaiting action</div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Leads by Status</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Expense Category Distribution (₹)</h3>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '60%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesChartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '40%', fontSize: '12px' }}>
                  {expensesChartData.map((entry, idx) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: COLORS[idx % COLORS.length] }} />
                      <span className="truncate" style={{ fontWeight: 500 }}>{entry.name}: ₹{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── MANAGER DASHBOARD ─── */}
      {role === 'manager' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <FolderKanban size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Leads</div>
                <div className="stat-card-value">{stats.totalLeads}</div>
                <div className="stat-card-sub">{stats.assignedLeads} Assigned Leads</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Clock size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Follow-ups</div>
                <div className="stat-card-value">{stats.pendingFollowUps}</div>
                <div className="stat-card-sub">Needs attention</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Site Visits Completed</div>
                <div className="stat-card-value">{stats.siteVisitsCompleted}</div>
                <div className="stat-card-sub">Surveys done</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Approvals</div>
                <div className="stat-card-value">{stats.pendingExpenseApprovals}</div>
                <div className="stat-card-sub">Expenses to review</div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Sales Funnel Status</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-navy)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Total Expense Claims (₹)</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expensesChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── TEAM LEAD DASHBOARD ─── */}
      {role === 'team_lead' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <FolderKanban size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Team Leads</div>
                <div className="stat-card-value">{stats.teamLeads}</div>
                <div className="stat-card-sub">Assigned to team</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <MapPin size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Team Site Visits</div>
                <div className="stat-card-value">{stats.teamSiteVisits}</div>
                <div className="stat-card-sub">Total surveys</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <Clock size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Follow-ups</div>
                <div className="stat-card-value">{stats.teamPendingFollowUps}</div>
                <div className="stat-card-sub">Overdue followups</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Approvals</div>
                <div className="stat-card-value">{stats.teamExpenseApprovals}</div>
                <div className="stat-card-sub">Team expenses to approve</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Team Lead Pipeline Status</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ─── FIELD EXECUTIVE DASHBOARD ─── */}
      {role === 'field_executive' && (
        <>
          <div className="grid-cols-3 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <FolderKanban size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">My Assigned Leads</div>
                <div className="stat-card-value">{stats.assignedLeads}</div>
                <div className="stat-card-sub">{stats.todayFollowUps} Follow-ups Today</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <MapPin size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Upcoming Site Visits</div>
                <div className="stat-card-value">{stats.upcomingSiteVisits}</div>
                <div className="stat-card-sub">Scheduled surveys</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <Wallet size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Paid Reimbursements</div>
                <div className="stat-card-value">{stats.paidReimbursements}</div>
                <div className="stat-card-sub">{stats.submittedExpenses} Submitted Expenses</div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>My Lead Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>My Expenses by Status</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.keys(stats.myExpensesByStatus || {}).map(k => ({ name: k, value: stats.myExpensesByStatus[k] }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {Object.keys(stats.myExpensesByStatus || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── FINANCE DASHBOARD ─── */}
      {role === 'finance_user' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <Receipt size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Approved Expenses</div>
                <div className="stat-card-value">{stats.approvedExpenses}</div>
                <div className="stat-card-sub">Awaiting verification</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <Clock size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Verification</div>
                <div className="stat-card-value">{stats.pendingVerification}</div>
                <div className="stat-card-sub">In queue</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Paid Claims</div>
                <div className="stat-card-value">{stats.paidExpenses}</div>
                <div className="stat-card-sub">{stats.rejectedExpenses} Rejected Claims</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Wallet size={24} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Reimbursed</div>
                <div className="stat-card-value">₹{stats.monthlyReimbursement}</div>
                <div className="stat-card-sub">All-time total</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Expense Reclaim Category Breakdown (₹)</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expensesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="value" fill="var(--color-navy)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
