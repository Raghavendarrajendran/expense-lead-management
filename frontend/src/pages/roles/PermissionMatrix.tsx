import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRole, getRolePermissions, setRolePermissions, getModules, getRoleLimit, updateRoleLimit } from '../../api/roles.api';
import { ArrowLeft, Save, Shield, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_ACTIONS = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'assign', label: 'Assign' },
  { id: 'approve', label: 'Approve' },
  { id: 'reject', label: 'Reject' },
  { id: 'upload', label: 'Upload' },
  { id: 'verify', label: 'Verify' },
  { id: 'mark_as_paid', label: 'Mark Paid' },
  { id: 'export', label: 'Export' },
  { id: 'download', label: 'Download' },
  { id: 'comment', label: 'Comment' },
  { id: 'change_status', label: 'Status Chg' }
];

export const PermissionMatrix = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Limits state
  const [weeklyLimit, setWeeklyLimit] = useState<string>('0');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('0');

  // Local grid matrix state: Record<moduleId, Array<actionId>>
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getRole(id),
      getModules(),
      getRolePermissions(id),
      getRoleLimit(id)
    ])
      .then(([roleRes, modulesRes, permsRes, limitRes]) => {
        setRole(roleRes.data.data);
        setModules(modulesRes.data.data);
        setPermissions(permsRes.data.data);
        if (limitRes.data.data) {
          setWeeklyLimit(String(limitRes.data.data.weeklyLimit || 0));
          setMonthlyLimit(String(limitRes.data.data.monthlyLimit || 0));
        }

        // Convert backend role permissions to frontend matrix structure
        const initialMatrix: Record<string, string[]> = {};
        modulesRes.data.data.forEach((m: any) => {
          const matchedPerm = permsRes.data.data.find((p: any) => p.moduleId === m.id);
          initialMatrix[m.id] = matchedPerm ? matchedPerm.actions : [];
        });
        setMatrix(initialMatrix);
      })
      .catch(err => {
        toast.error('Failed to load permission matrix');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCheckboxChange = (moduleId: string, actionId: string, checked: boolean) => {
    setMatrix(prev => {
      const currentActions = prev[moduleId] || [];
      const updatedActions = checked
        ? [...currentActions, actionId]
        : currentActions.filter(a => a !== actionId);
      return { ...prev, [moduleId]: updatedActions };
    });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      // Re-format matrix back to backend array payload
      const payloadPermissions = Object.keys(matrix).map(moduleId => ({
        moduleId,
        actions: matrix[moduleId]
      })).filter(p => p.actions.length > 0);

      await Promise.all([
        setRolePermissions(id, payloadPermissions),
        updateRoleLimit(id, {
          weeklyLimit: Number(weeklyLimit) || 0,
          monthlyLimit: Number(monthlyLimit) || 0
        })
      ]);

      toast.success('Role permissions and limits updated successfully');
      navigate('/roles');
    } catch (err: any) {
      toast.error('Failed to save permissions matrix and limits');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="permission-matrix-page animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/roles')}>
          <ArrowLeft size={14} /> Back to Roles
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={24} color="var(--color-primary)" />
            <h1 className="page-title">Permissions: {role?.displayName}</h1>
          </div>
          <p className="page-subtitle">Configure module-wise permission actions for this role.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving Matrix...' : 'Save Matrix Changes'}
          </button>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table className="perm-matrix">
          <thead>
            <tr>
              <th style={{ width: '220px' }}>Module Name</th>
              {ALL_ACTIONS.map(action => (
                <th key={action.id} title={action.label}>{action.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(mod => (
              <tr key={mod.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{mod.name}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{mod.description}</div>
                </td>
                {ALL_ACTIONS.map(action => {
                  const isChecked = (matrix[mod.id] || []).includes(action.id);
                  return (
                    <td key={action.id}>
                      <input
                        type="checkbox"
                        className="perm-check"
                        checked={isChecked}
                        onChange={e => handleCheckboxChange(mod.id, action.id, e.target.checked)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Receipt size={20} color="var(--color-primary)" />
          <h3 style={{ margin: 0, fontWeight: 700 }}>Role-based Reimbursement Limits</h3>
        </div>
        <p className="text-muted" style={{ marginBottom: '16px', fontSize: '13px' }}>
          Configure the maximum reimbursement amount users with this role can submit or be approved for. Set limits to <strong>0</strong> to allow unlimited filings.
        </p>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Weekly Limit (₹)</label>
            <input
              type="number"
              className="form-input"
              value={weeklyLimit}
              onChange={e => setWeeklyLimit(e.target.value)}
              placeholder="e.g. 5000"
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit (₹)</label>
            <input
              type="number"
              className="form-input"
              value={monthlyLimit}
              onChange={e => setMonthlyLimit(e.target.value)}
              placeholder="e.g. 20000"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
