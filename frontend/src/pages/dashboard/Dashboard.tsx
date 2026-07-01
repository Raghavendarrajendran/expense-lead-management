import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboard } from '../../api/dashboard.api';
import {
  Users, UserCheck, FolderKanban, Receipt, CheckCircle,
  TrendingUp, Award, Clock, FileText, Wallet, Calendar, AlertTriangle, MapPin
} from 'lucide-react';
import { EChart, CHART_COLORS, TOOLTIP_STYLE, AXIS_LABEL_STYLE, AXIS_LINE_STYLE, SPLIT_LINE_STYLE, gradientBar } from '../../components/charts/EChart';
import { PreSalesDashboard } from '../presales/PreSalesDashboard';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 36, height: 36 }} />
      </div>
    );
  }

  if (!stats) return <div className="card">Error loading dashboard data.</div>;

  const role = user?.role?.name;

  if (role === 'sales_executive' || role === 'engineering_user' || role === 'commercial_user') {
    return <PreSalesDashboard />;
  }

  // ── Chart data ────────────────────────────────────────────────
  const leadStatusEntries = stats.leadsByStatus
    ? Object.entries(stats.leadsByStatus as Record<string, number>)
    : [];
  const expenseCatEntries = stats.expensesByCategory
    ? Object.entries(stats.expensesByCategory as Record<string, number>)
    : [];

  // ── ECharts option builders ───────────────────────────────────

  /** Vertical bar chart — lead status */
  const leadsBarOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      ...TOOLTIP_STYLE,
      formatter: (params: any) => {
        const p = params[0];
        return `<b>${p.name}</b><br/>Count: <b style="color:${CHART_COLORS[0]}">${p.value}</b>`;
      },
    },
    grid: { left: 16, right: 16, top: 16, bottom: 32, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: leadStatusEntries.map(([k]) => k),
      axisLabel: { ...AXIS_LABEL_STYLE, rotate: leadStatusEntries.length > 5 ? 30 : 0 },
      axisTick: { show: false },
      axisLine: AXIS_LINE_STYLE,
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: AXIS_LABEL_STYLE,
      splitLine: SPLIT_LINE_STYLE,
      axisLine: { show: false },
    },
    series: [{
      type: 'bar' as const,
      data: leadStatusEntries.map(([, v], i) => ({
        value: v,
        itemStyle: {
          color: gradientBar(CHART_COLORS[i % CHART_COLORS.length]),
          borderRadius: [6, 6, 0, 0] as [number, number, number, number],
        },
      })),
      barMaxWidth: 52,
      emphasis: {
        itemStyle: { shadowBlur: 12, shadowColor: 'rgba(37,99,235,0.4)' },
      },
    }],
  };

  /** Donut chart — expense category */
  const expenseDonutOption = {
    tooltip: {
      trigger: 'item' as const,
      ...TOOLTIP_STYLE,
      formatter: (p: any) =>
        `<b>${p.name}</b><br/>Amount: <b style="color:${p.color}">₹${p.value.toLocaleString()}</b><br/>Share: <b>${p.percent}%</b>`,
    },
    legend: {
      orient: 'vertical' as const,
      right: 8,
      top: 'center',
      textStyle: { color: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif' },
      icon: 'circle',
      itemWidth: 8, itemHeight: 8, itemGap: 10,
    },
    series: [{
      type: 'pie' as const,
      radius: ['42%', '68%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 700, color: '#0F172A' },
        itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.15)' },
      },
      data: expenseCatEntries.map(([name, value], i) => ({
        name, value,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })),
    }],
  };

  /** Horizontal bar chart — expense by category */
  const expenseHorizOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      ...TOOLTIP_STYLE,
      formatter: (params: any) => {
        const p = params[0];
        return `<b>${p.name}</b><br/>₹<b style="color:${CHART_COLORS[1]}">${Number(p.value).toLocaleString()}</b>`;
      },
    },
    grid: { left: 16, right: 24, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value' as const,
      axisLabel: { ...AXIS_LABEL_STYLE, formatter: (v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}` },
      splitLine: SPLIT_LINE_STYLE,
      axisLine: { show: false },
    },
    yAxis: {
      type: 'category' as const,
      data: expenseCatEntries.map(([k]) => k),
      axisLabel: AXIS_LABEL_STYLE,
      axisTick: { show: false },
      axisLine: AXIS_LINE_STYLE,
    },
    series: [{
      type: 'bar' as const,
      data: expenseCatEntries.map(([, v], i) => ({
        value: v,
        itemStyle: {
          color: gradientBar(CHART_COLORS[i % CHART_COLORS.length]),
          borderRadius: [0, 6, 6, 0] as [number, number, number, number],
        },
      })),
      barMaxWidth: 28,
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(37,99,235,0.3)' } },
    }],
  };

  /** Pie chart — expense by status */
  const myExpenseStatusOption = {
    tooltip: {
      trigger: 'item' as const,
      ...TOOLTIP_STYLE,
      formatter: (p: any) =>
        `<b>${p.name}</b><br/>Count: <b style="color:${p.color}">${p.value}</b> (${p.percent}%)`,
    },
    legend: {
      bottom: 0, left: 'center',
      textStyle: { color: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif' },
      icon: 'roundRect',
      itemWidth: 10, itemHeight: 6, itemGap: 12,
    },
    series: [{
      type: 'pie' as const,
      radius: ['36%', '62%'],
      center: ['50%', '44%'],
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 700, color: '#0F172A' },
        itemStyle: { shadowBlur: 14, shadowColor: 'rgba(0,0,0,0.15)' },
      },
      data: Object.entries((stats.myExpensesByStatus || {}) as Record<string, number>).map(
        ([name, value], i) => ({
          name,
          value: Number(value),
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })
      ),
    }],
  };

  return (
    <div className="dashboard animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Welcome, {user?.name} 👋</h1>
          <p className="page-subtitle">Here is what is happening at ZSmart today.</p>
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
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><Users size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Users</div>
                <div className="stat-card-value">{stats.totalUsers}</div>
                <div className="stat-card-sub">{stats.activeUsers} Active</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><FolderKanban size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Leads</div>
                <div className="stat-card-value">{stats.totalLeads}</div>
                <div className="stat-card-sub">Active pipeline</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><Receipt size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Expenses</div>
                <div className="stat-card-value">{stats.totalExpenses}</div>
                <div className="stat-card-sub">{stats.paidExpenses} Paid</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><Clock size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Approvals</div>
                <div className="stat-card-value">{stats.pendingApprovals}</div>
                <div className="stat-card-sub">Awaiting action</div>
              </div>
            </div>
          </div>

          {/* Pre-Sales Pipeline Summary */}
          <div className="mb-4">
            <h3 style={{ marginBottom: '12px', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
              Solar Pre-Sales CRM Summary
            </h3>
            <div className="grid-cols-4">
              <div className="stat-card" style={{ borderTop: '3px solid #2563EB' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">Pre-Sales Leads</div>
                  <div className="stat-card-value" style={{ fontSize: '20px' }}>{stats.psStats?.totalPsLeads || 0}</div>
                  <div className="stat-card-sub">Solar pipeline</div>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '3px solid #F97316' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">TCO Proposals</div>
                  <div className="stat-card-value" style={{ fontSize: '20px' }}>{stats.psStats?.totalProposals || 0}</div>
                  <div className="stat-card-sub">Drafted commercial quotes</div>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '3px solid #10B981' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">Secured Bookings</div>
                  <div className="stat-card-value" style={{ fontSize: '18px' }}>₹{(stats.psStats?.totalOrderValue || 0).toLocaleString()}</div>
                  <div className="stat-card-sub">{stats.psStats?.totalOrders || 0} Finalized POs</div>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '3px solid #CFFAFE' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">Active Pre-Sales Users</div>
                  <div className="stat-card-value" style={{ fontSize: '20px' }}>3</div>
                  <div className="stat-card-sub">Eng, Sales, Comm</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Leads by Status</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Pipeline distribution across all stages</p>
              <EChart option={leadsBarOption} height={280} />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Expense Category Distribution</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Reimbursement breakdown by category (₹)</p>
              <EChart option={expenseDonutOption} height={280} />
            </div>
          </div>
        </>
      )}

      {/* ─── MANAGER DASHBOARD ─── */}
      {role === 'manager' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><FolderKanban size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Leads</div>
                <div className="stat-card-value">{stats.totalLeads}</div>
                <div className="stat-card-sub">{stats.assignedLeads} Assigned</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><Clock size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Follow-ups</div>
                <div className="stat-card-value">{stats.pendingFollowUps}</div>
                <div className="stat-card-sub">Needs attention</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><CheckCircle size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Site Visits Done</div>
                <div className="stat-card-value">{stats.siteVisitsCompleted}</div>
                <div className="stat-card-sub">Surveys completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}><AlertTriangle size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Approvals</div>
                <div className="stat-card-value">{stats.pendingExpenseApprovals}</div>
                <div className="stat-card-sub">Expenses to review</div>
              </div>
            </div>
          </div>

          {/* Pre-Sales Pipeline Summary */}
          <div className="mb-4">
            <h3 style={{ marginBottom: '12px', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
              Solar Pre-Sales CRM Summary
            </h3>
            <div className="grid-cols-4">
              <div className="stat-card" style={{ borderTop: '3px solid #2563EB' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">Pre-Sales Leads</div>
                  <div className="stat-card-value" style={{ fontSize: '20px' }}>{stats.psStats?.totalPsLeads || 0}</div>
                  <div className="stat-card-sub">Active pipeline</div>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '3px solid #F97316' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">Pending Inspections</div>
                  <div className="stat-card-value" style={{ fontSize: '20px' }}>{stats.psStats?.pendingInspections || 0}</div>
                  <div className="stat-card-sub">Site survey requests</div>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '3px solid #10B981' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">Approved Proposals</div>
                  <div className="stat-card-value" style={{ fontSize: '20px' }}>{stats.psStats?.approvedProposals || 0}</div>
                  <div className="stat-card-sub">Signed-off TCO offers</div>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '3px solid #CFFAFE' }}>
                <div className="stat-card-content">
                  <div className="stat-card-label">Accepted Offers</div>
                  <div className="stat-card-value" style={{ fontSize: '20px' }}>{stats.psStats?.acceptedProposals || 0}</div>
                  <div className="stat-card-sub">Awaiting PO handover</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Sales Funnel Status</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Lead pipeline across all stages</p>
              <EChart option={leadsBarOption} height={280} />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Expense Claims by Category</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Total amounts claimed per category (₹)</p>
              <EChart option={expenseHorizOption} height={280} />
            </div>
          </div>
        </>
      )}

      {/* ─── TEAM LEAD DASHBOARD ─── */}
      {role === 'team_lead' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><FolderKanban size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Team Leads</div>
                <div className="stat-card-value">{stats.teamLeads}</div>
                <div className="stat-card-sub">Assigned to team</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><MapPin size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Team Site Visits</div>
                <div className="stat-card-value">{stats.teamSiteVisits}</div>
                <div className="stat-card-sub">Total surveys</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><Clock size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Follow-ups</div>
                <div className="stat-card-value">{stats.teamPendingFollowUps}</div>
                <div className="stat-card-sub">Overdue follow-ups</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><CheckCircle size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Approvals</div>
                <div className="stat-card-value">{stats.teamExpenseApprovals}</div>
                <div className="stat-card-sub">Team expenses</div>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Team Lead Pipeline Status</h3>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Lead status distribution for your team</p>
            <EChart option={leadsBarOption} height={280} />
          </div>
        </>
      )}

      {/* ─── FIELD EXECUTIVE DASHBOARD ─── */}
      {role === 'field_executive' && (
        <>
          <div className="grid-cols-3 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><FolderKanban size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">My Assigned Leads</div>
                <div className="stat-card-value">{stats.assignedLeads}</div>
                <div className="stat-card-sub">{stats.todayFollowUps} Follow-ups Today</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><MapPin size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Upcoming Site Visits</div>
                <div className="stat-card-value">{stats.upcomingSiteVisits}</div>
                <div className="stat-card-sub">Scheduled surveys</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><Wallet size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Paid Reimbursements</div>
                <div className="stat-card-value">{stats.paidReimbursements}</div>
                <div className="stat-card-sub">{stats.submittedExpenses} Submitted</div>
              </div>
            </div>
          </div>
          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>My Lead Status Distribution</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Your assigned leads by pipeline stage</p>
              <EChart option={leadsBarOption} height={280} />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>My Expenses by Status</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Expense claim status overview</p>
              <EChart option={myExpenseStatusOption} height={280} />
            </div>
          </div>
        </>
      )}

      {/* ─── FINANCE DASHBOARD ─── */}
      {role === 'finance_user' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><Receipt size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Approved Expenses</div>
                <div className="stat-card-value">{stats.approvedExpenses}</div>
                <div className="stat-card-sub">Awaiting verification</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><Clock size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Verification</div>
                <div className="stat-card-value">{stats.pendingVerification}</div>
                <div className="stat-card-sub">In queue</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><CheckCircle size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Paid Claims</div>
                <div className="stat-card-value">{stats.paidExpenses}</div>
                <div className="stat-card-sub">{stats.rejectedExpenses} Rejected</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><Wallet size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Reimbursed</div>
                <div className="stat-card-value">₹{stats.monthlyReimbursement}</div>
                <div className="stat-card-sub">All-time total</div>
              </div>
            </div>
          </div>
          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Expense Category Breakdown</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Reimbursement amounts per category (₹)</p>
              <EChart option={expenseDonutOption} height={280} />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Expense Claims by Category</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Horizontal breakdown per type (₹)</p>
              <EChart option={expenseHorizOption} height={280} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
