import React, { useEffect, useState } from 'react';
import { getLeadReports } from '../../api/reports.api';
import { getUsers } from '../../api/users.api';
import { useAuth } from '../../contexts/AuthContext';
import { EChart, CHART_COLORS, TOOLTIP_STYLE, AXIS_LABEL_STYLE, AXIS_LINE_STYLE, SPLIT_LINE_STYLE, gradientBar } from '../../components/charts/EChart';
import { Download, Calendar, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeadReports = () => {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<any>(null);
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [executiveId, setExecutiveId] = useState('');
  const [source, setSource] = useState('');

  const fetchReports = () => {
    setLoading(true);
    getLeadReports({ from, to, status, executiveId, source })
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [from, to, status, executiveId, source]);

  useEffect(() => {
    getUsers({ roleId: 'role_field_executive' })
      .then(res => setExecutives(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleExportExcel = () => {
    if (!data?.leads || data.leads.length === 0) {
      toast.error('No lead records to export');
      return;
    }
    const headers = ['Lead ID', 'Customer Name', 'Mobile', 'Email', 'Customer Type', 'Requirement', 'Location', 'City', 'State', 'Project Budget', 'Project Scale', 'Lead Source', 'Assigned Executive', 'Status', 'Created Date'];
    const rows = data.leads.map((l: any) => [
      l.id,
      l.customerName,
      l.mobile,
      l.email,
      l.customerType,
      l.requirementType,
      l.location,
      l.city,
      l.state,
      l.projectBudget,
      l.projectScale,
      l.leadSource,
      l.assignedExecutiveName || 'Unassigned',
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ZSmart_LeadsReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel/CSV Report downloaded successfully!');
  };

  const handleExportPDF = () => {
    if (!data?.leads || data.leads.length === 0) {
      toast.error('No lead records to export');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocker is enabled. Please allow pop-ups.');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>ZSmart - Leads Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #2563EB; margin-bottom: 5px; }
            h2 { color: #666; font-size: 14px; font-weight: normal; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; color: #0F172A; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            .badge { display: inline-block; padding: 3px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; background: #e2e8f0; color: #333; }
            .summary-box { display: flex; gap: 20px; margin-bottom: 20px; }
            .summary-card { border: 1px solid #ddd; padding: 10px 15px; border-radius: 5px; min-width: 120px; }
            .summary-label { font-size: 10px; color: #888; text-transform: uppercase; }
            .summary-value { font-size: 20px; font-weight: bold; color: #2563EB; }
          </style>
        </head>
        <body>
          <h1>ZSmart</h1>
          <h2>Leads Pipeline Report — Generated on ${new Date().toLocaleDateString()}</h2>
          
          <div class="summary-box">
            <div class="summary-card">
              <div class="summary-label">Total Leads</div>
              <div class="summary-value">${data.total}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Converted Leads</div>
              <div class="summary-value">${data.converted}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Conversion Rate</div>
              <div class="summary-value">${data.conversionRate}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile</th>
                <th>Requirement</th>
                <th>City</th>
                <th>Lead Source</th>
                <th>Status</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              ${data.leads.map((l: any) => `
                <tr>
                  <td><strong>${l.customerName}</strong><br><span style="color:#666;font-size:10px">${l.email}</span></td>
                  <td>${l.mobile}</td>
                  <td>${l.requirementType}</td>
                  <td>${l.city}</td>
                  <td>${l.leadSource}</td>
                  <td><span class="badge">${l.status}</span></td>
                  <td>${new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('PDF document print preview loaded!');
  };

  const getStatusClass = (st: string) => {
    switch (st) {
      case 'New': return 'badge-new';
      case 'Assigned': return 'badge-assigned';
      case 'Contacted': return 'badge-contacted';
      case 'Field Visit Scheduled': return 'badge-scheduled';
      case 'Field Visit Completed': return 'badge-completed';
      case 'Converted': return 'badge-converted';
      case 'Lost': return 'badge-lost';
      default: return 'badge-draft';
    }
  };

  // ECharts Option builders
  const sourceEntries = data?.bySource ? Object.entries(data.bySource as Record<string, number>) : [];
  const statusEntries = data?.byStatus ? Object.entries(data.byStatus as Record<string, number>) : [];

  const sourceChartOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      ...TOOLTIP_STYLE,
      formatter: (params: any) => {
        const p = params[0];
        return `<b>${p.name}</b><br/>Leads: <b style="color:${CHART_COLORS[0]}">${p.value}</b>`;
      },
    },
    grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: sourceEntries.map(([k]) => k),
      axisLabel: AXIS_LABEL_STYLE,
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
      data: sourceEntries.map(([, v], i) => ({
        value: v,
        itemStyle: {
          color: gradientBar(CHART_COLORS[i % CHART_COLORS.length]),
          borderRadius: [6, 6, 0, 0] as [number, number, number, number],
        },
      })),
      barMaxWidth: 40,
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(37,99,235,0.3)' } },
    }],
  };

  const statusChartOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      ...TOOLTIP_STYLE,
      formatter: (params: any) => {
        const p = params[0];
        return `<b>${p.name}</b><br/>Leads: <b style="color:${CHART_COLORS[1]}">${p.value}</b>`;
      },
    },
    grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: statusEntries.map(([k]) => k),
      axisLabel: AXIS_LABEL_STYLE,
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
      data: statusEntries.map(([, v], i) => ({
        value: v,
        itemStyle: {
          color: gradientBar(CHART_COLORS[(i + 3) % CHART_COLORS.length]),
          borderRadius: [6, 6, 0, 0] as [number, number, number, number],
        },
      })),
      barMaxWidth: 40,
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(6,182,212,0.3)' } },
    }],
  };

  return (
    <div className="lead-reports animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Lead Source & Status Reports</h1>
          <p className="page-subtitle">Analyze leads pipeline, conversions, and metrics.</p>
        </div>
        {hasPermission('mod_reports', 'export') && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={handleExportExcel} disabled={!data?.leads?.length}>
              <Download size={14} /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF} disabled={!data?.leads?.length}>
              <Download size={14} /> Export PDF
            </button>
          </div>
        )}
      </div>

      <div className="card mb-4">
        <h3 style={{ marginBottom: '12px', fontWeight: 700 }}>Report Filters</h3>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Lead Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="Contacted">Contacted</option>
              <option value="Site Visit Scheduled">Site Visit Scheduled</option>
              <option value="Site Survey Completed">Site Survey Completed</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: '12px' }}>
          <div className="form-group">
            <label className="form-label">Field Executive</label>
            <select className="form-select" value={executiveId} onChange={e => setExecutiveId(e.target.value)}>
              <option value="">All Executives</option>
              {executives.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lead Source</label>
            <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="Reference">Reference</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Social Media">Social Media</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '40vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 36, height: 36 }} />
        </div>
      ) : data ? (
        <>
          <div className="grid-cols-3 mb-4">
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-label">Total Leads Found</div>
                <div className="stat-card-value">{data.total}</div>
                <div className="stat-card-sub">In selected filter</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-label">Converted Leads</div>
                <div className="stat-card-value">{data.converted}</div>
                <div className="stat-card-sub">Total sales conversions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-label">Conversion Rate</div>
                <div className="stat-card-value">{data.conversionRate}%</div>
                <div className="stat-card-sub">Sales effectiveness</div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2 mb-4">
            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Lead Source Breakdown</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Leads classified by acquisition source</p>
              <EChart option={sourceChartOption} height={240} />
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '4px', fontWeight: 700, fontSize: 15 }}>Lead Status Distribution</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Lead count per stage in pipeline</p>
              <EChart option={statusChartOption} height={240} />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Bill Amount</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {data.leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">No records matching filters.</td>
                  </tr>
                ) : (
                  data.leads.map((l: any) => (
                    <tr key={l.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{l.customerName}</span>
                        <div className="text-muted" style={{ fontSize: '11px' }}>{l.mobile}</div>
                      </td>
                      <td>{l.city}, {l.state}</td>
                      <td>₹{l.electricityBillAmount}</td>
                      <td>{l.leadSource}</td>
                      <td>
                        <span className={`badge ${getStatusClass(l.status)}`}>{l.status}</span>
                      </td>
                      <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};
