import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboard } from '../../api/dashboard.api';
import {
  Users, UserCheck, FolderKanban, Receipt, CheckCircle,
  TrendingUp, Clock, FileText, Wallet, Calendar, AlertTriangle, MapPin, Sun, Zap, Package, Calculator, ThumbsUp
} from 'lucide-react';
import { EChart, CHART_COLORS, TOOLTIP_STYLE, AXIS_LABEL_STYLE, AXIS_LINE_STYLE, SPLIT_LINE_STYLE, gradientBar } from '../../components/charts/EChart';

export const PreSalesDashboard = () => {
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

  // ── Sales Executive Charts ──────────────────────────────────────────
  const leadStatusEntries = stats.leadsByStatus ? Object.entries(stats.leadsByStatus) : [];
  const proposalsStatusEntries = stats.proposalsByStatus ? Object.entries(stats.proposalsByStatus) : [];

  const leadsBarOption = {
    tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const }, ...TOOLTIP_STYLE },
    grid: { left: 16, right: 16, top: 16, bottom: 32, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: leadStatusEntries.map(([k]) => k),
      axisLabel: AXIS_LABEL_STYLE,
      axisTick: { show: false },
      axisLine: AXIS_LINE_STYLE,
    },
    yAxis: { type: 'value' as const, axisLabel: AXIS_LABEL_STYLE, splitLine: SPLIT_LINE_STYLE, axisLine: { show: false } },
    series: [{
      type: 'bar' as const,
      data: leadStatusEntries.map(([, v], i) => ({
        value: v as number,
        itemStyle: { color: gradientBar(CHART_COLORS[i % CHART_COLORS.length]), borderRadius: [6, 6, 0, 0] },
      })),
      barMaxWidth: 48,
    }],
  };

  const proposalsDonutOption = {
    tooltip: { trigger: 'item' as const, ...TOOLTIP_STYLE },
    legend: { bottom: 0, left: 'center', textStyle: { color: '#64748B', fontSize: 11 } },
    series: [{
      type: 'pie' as const,
      radius: ['40%', '65%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: proposalsStatusEntries.map(([name, value], i) => ({
        name, value: value as number,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })),
    }],
  };

  // ── Engineering User Charts ────────────────────────────────────────
  const inspectionsStatusEntries = stats.inspectionsByStatus ? Object.entries(stats.inspectionsByStatus) : [];
  const inspectionsPieOption = {
    tooltip: { trigger: 'item' as const, ...TOOLTIP_STYLE },
    legend: { bottom: 0, left: 'center', textStyle: { color: '#64748B', fontSize: 11 } },
    series: [{
      type: 'pie' as const,
      radius: '65%',
      center: ['50%', '45%'],
      label: { show: false },
      data: inspectionsStatusEntries.map(([name, value], i) => ({
        name, value: value as number,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })),
    }],
  };

  // ── Commercial User Charts ─────────────────────────────────────────
  const paymentsStatusEntries = stats.paymentsByStatus ? Object.entries(stats.paymentsByStatus) : [];
  const paymentsPieOption = {
    tooltip: { trigger: 'item' as const, ...TOOLTIP_STYLE },
    legend: { bottom: 0, left: 'center', textStyle: { color: '#64748B', fontSize: 11 } },
    series: [{
      type: 'pie' as const,
      radius: ['35%', '60%'],
      label: { show: false },
      data: paymentsStatusEntries.map(([name, value], i) => ({
        name, value: Number(value),
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })),
    }],
  };

  return (
    <div className="dashboard animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Welcome, {user?.name} 👋</h1>
          <p className="page-subtitle">Here is the ZSmart Solar Pre-Sales lifecycle status overview today.</p>
        </div>
        <div className="page-actions">
          <span className="badge badge-scheduled" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Calendar size={14} style={{ marginRight: '6px' }} />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ─── SALES EXECUTIVE DASHBOARD ─── */}
      {role === 'sales_executive' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><FolderKanban size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">My Leads</div>
                <div className="stat-card-value">{stats.totalPsLeads}</div>
                <div className="stat-card-sub">{stats.qualifiedLeads} Qualified</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><FileText size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">TCO Proposals</div>
                <div className="stat-card-value">{stats.totalProposals}</div>
                <div className="stat-card-sub">{stats.proposalsApproved} Approved</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><CheckCircle size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Finalized Orders</div>
                <div className="stat-card-value">{stats.totalOrders}</div>
                <div className="stat-card-sub">{stats.proposalsAccepted} Proposals Accepted</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><Wallet size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Negotiated Bookings</div>
                <div className="stat-card-value">₹{(stats.orderValue || 0).toLocaleString()}</div>
                <div className="stat-card-sub">PO values secured</div>
              </div>
            </div>
          </div>
          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>My Pipeline Stage Funnel</h3>
              <EChart option={leadsBarOption} height={280} />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Proposal Distribution</h3>
              <EChart option={proposalsDonutOption} height={280} />
            </div>
          </div>
        </>
      )}

      {/* ─── ENGINEERING DASHBOARD ─── */}
      {role === 'engineering_user' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><MapPin size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Assigned Audits</div>
                <div className="stat-card-value">{stats.assignedInspections}</div>
                <div className="stat-card-sub">{stats.completedInspections} Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><Sun size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Surveys Done</div>
                <div className="stat-card-value">{stats.surveysPerformed}</div>
                <div className="stat-card-sub">Solar feasibility reports</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><Zap size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Layouts</div>
                <div className="stat-card-value">{stats.pendingLayouts}</div>
                <div className="stat-card-sub">Array configurations</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><Package size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending BOM Builds</div>
                <div className="stat-card-value">{stats.pendingBoms}</div>
                <div className="stat-card-sub">Hardware specs</div>
              </div>
            </div>
          </div>
          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Site Inspections Overview</h3>
              <EChart option={inspectionsPieOption} height={280} />
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>
              <h3>Engineering Quick Checklist</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', listStyleType: 'none', padding: 0 }}>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>✅ RCC Flat roof structures configuration</li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>✅ Shadow obstruction height evaluations</li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>✅ Transformer capacity net metering approvals</li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>✅ South-facing array layout drawing attachments</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* ─── COMMERCIAL DASHBOARD ─── */}
      {role === 'commercial_user' && (
        <>
          <div className="grid-cols-4 mb-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}><Calculator size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending Costing</div>
                <div className="stat-card-value">{stats.pendingCosting}</div>
                <div className="stat-card-sub">Awaiting commercial valuation</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}><ThumbsUp size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Offer Signoffs Due</div>
                <div className="stat-card-value">{stats.pendingApprovals}</div>
                <div className="stat-card-sub">Internal proposals approval queue</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><CheckCircle size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Finalized Orders</div>
                <div className="stat-card-value">{stats.totalOrders}</div>
                <div className="stat-card-sub">₹{(stats.totalOrderValue || 0).toLocaleString()} value</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><Wallet size={24} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Payments Collected</div>
                <div className="stat-card-value">₹{(stats.paymentCollected || 0).toLocaleString()}</div>
                <div className="stat-card-sub">{stats.duePayments} Milestones outstanding</div>
              </div>
            </div>
          </div>
          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Advance Milestone Collections</h3>
              <EChart option={paymentsPieOption} height={280} />
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>
              <h3>Commercial Directives</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', listStyleType: 'none', padding: 0 }}>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>📊 Verify material cost vs BOM amount values</li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>📊 Implement 15% gross profit margin targets</li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>📊 Issue Proforma Invoice (PI) upon PO receipt</li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>📊 Track 50% initial advance payment release</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
