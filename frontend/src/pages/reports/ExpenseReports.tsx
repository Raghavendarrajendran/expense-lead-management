import React, { useEffect, useState } from 'react';
import { getExpenseReports } from '../../api/reports.api';
import { getUsers } from '../../api/users.api';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Calendar, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExpenseReports = () => {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<any>(null);
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [executiveId, setExecutiveId] = useState('');
  const [category, setCategory] = useState('');

  const fetchReports = () => {
    setLoading(true);
    getExpenseReports({ from, to, status, executiveId, category })
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [from, to, status, executiveId, category]);

  useEffect(() => {
    getUsers({ roleId: 'role_field_executive' })
      .then(res => setExecutives(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleExportExcel = () => {
    if (!data?.expenses || data.expenses.length === 0) {
      toast.error('No expense records to export');
      return;
    }
    const headers = ['Expense ID', 'Executive Name', 'Category', 'Amount (₹)', 'Travel Date', 'From Location', 'To Location', 'Payment Mode', 'Status', 'Purpose of Visit'];
    const rows = data.expenses.map((e: any) => [
      e.id,
      e.executiveName,
      e.category,
      e.amount,
      e.expenseDate,
      e.fromLocation || '—',
      e.toLocation || '—',
      e.paymentMode,
      e.status,
      e.purposeOfVisit || '—',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AadhanSolar_ExpensesReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel/CSV Expense Report downloaded successfully!');
  };

  const handleExportPDF = () => {
    if (!data?.expenses || data.expenses.length === 0) {
      toast.error('No expense records to export');
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
          <title>Aadhan Solar - Expenses Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1E3A5F; margin-bottom: 5px; }
            h2 { color: #666; font-size: 14px; font-weight: normal; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; color: #1E3A5F; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            .badge { display: inline-block; padding: 3px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; background: #e2e8f0; color: #333; }
            .summary-box { display: flex; gap: 20px; margin-bottom: 20px; }
            .summary-card { border: 1px solid #ddd; padding: 10px 15px; border-radius: 5px; min-width: 120px; }
            .summary-label { font-size: 10px; color: #888; text-transform: uppercase; }
            .summary-value { font-size: 20px; font-weight: bold; color: #1E3A5F; }
          </style>
        </head>
        <body>
          <h1>Aadhan Solar</h1>
          <h2>Expenses Reimbursements Report — Generated on ${new Date().toLocaleDateString()}</h2>
          
          <div class="summary-box">
            <div class="summary-card">
              <div class="summary-label">Total Claims</div>
              <div class="summary-value">${data.total}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Claimed Amount</div>
              <div class="summary-value">₹${data.totalAmount}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Paid Reimbursements</div>
              <div class="summary-value" style="color: #10B981;">₹${data.paidAmount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Executive</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Claim Date</th>
                <th>Status</th>
                <th>Customer / Location</th>
              </tr>
            </thead>
            <tbody>
              ${data.expenses.map((e: any) => `
                <tr>
                  <td><strong>${e.executiveName}</strong></td>
                  <td>${e.category}</td>
                  <td><strong>₹${e.amount}</strong></td>
                  <td>${e.expenseDate}</td>
                  <td><span class="badge">${e.status}</span></td>
                  <td>${e.customerName || 'None'}<br><span style="color:#666;font-size:10px">${e.fromLocation || ''} to ${e.toLocation || ''}</span></td>
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
      case 'Draft': return 'badge-draft';
      case 'Submitted': return 'badge-submitted';
      case 'Manager Approved': return 'badge-approved';
      case 'Finance Verified': return 'badge-verified';
      case 'Paid': return 'badge-converted';
      case 'Rejected': return 'badge-lost';
      default: return 'badge-draft';
    }
  };

  return (
    <div className="expense-reports animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Expense Category & Reimbursement Reports</h1>
          <p className="page-subtitle">Analyze expense claims, approvals, and paid reimbursements.</p>
        </div>
        {hasPermission('mod_reports', 'export') && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={handleExportExcel} disabled={!data?.expenses?.length}>
              <Download size={14} /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF} disabled={!data?.expenses?.length}>
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
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Petrol Bill">Petrol Bill</option>
              <option value="Bus Ticket">Bus Ticket</option>
              <option value="Auto/Cab">Auto/Cab</option>
              <option value="Food">Food</option>
              <option value="Parking">Parking</option>
              <option value="Toll">Toll</option>
              <option value="Lodging">Lodging</option>
              <option value="Mobile Recharge">Mobile Recharge</option>
              <option value="Miscellaneous">Miscellaneous</option>
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
            <label className="form-label">Expense Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Manager Approved">Manager Approved</option>
              <option value="Finance Verified">Finance Verified</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '40vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
        </div>
      ) : data ? (
        <>
          <div className="grid-cols-3 mb-4">
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-label">Total Expense Claims</div>
                <div className="stat-card-value">{data.total}</div>
                <div className="stat-card-sub">In selected filter</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-label">Total Amount Claimed</div>
                <div className="stat-card-value">₹{data.totalAmount}</div>
                <div className="stat-card-sub">Submitted amount</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-label">Total Reimbursed (Paid)</div>
                <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>₹{data.paidAmount}</div>
                <div className="stat-card-sub">Completed payments</div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2 mb-4">
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Expense Category Distribution (₹)</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.keys(data.byCategory || {}).map(k => ({ name: k, amount: data.byCategory[k] }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Executive-wise Expenditure (₹)</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.keys(data.byExecutive || {}).map(k => ({ name: k, amount: data.byExecutive[k] }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="amount" fill="var(--color-navy)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Executive</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Associated Customer</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">No expense claims matching filters.</td>
                  </tr>
                ) : (
                  data.expenses.map((e: any) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.executiveName}</td>
                      <td>{e.category}</td>
                      <td style={{ fontWeight: 700 }}>₹{e.amount}</td>
                      <td>{e.expenseDate}</td>
                      <td>
                        <span className={`badge ${getStatusClass(e.status)}`}>{e.status}</span>
                      </td>
                      <td>{e.customerName || 'None'}</td>
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
