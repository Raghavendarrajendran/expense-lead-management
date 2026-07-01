import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoms } from '../../../api/presales.api';
import { Plus, Package, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const BomList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [boms, setBoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');

  useEffect(() => {
    getBoms()
      .then(res => setBoms(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const calculateTotalCost = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

  const filteredBoms = boms.filter(b => 
    b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    b.createdByName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Bills of Materials (BOM)</h1>
          <p className="page-subtitle">Rooftop structures, solar panels, inverters, cables, and structural items list.</p>
        </div>
        {hasPermission('mod_ps_bom', 'create') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/presales/bom/new')}>
              <Plus size={16} /> Create BOM
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : (
        <div className="card table-wrapper">
          <div className="table-toolbar">
            <div className="table-search">
              <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by customer or designer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredBoms.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B', border: 'none' }}>
              No bills of materials matching your filters.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Items Count</th>
                  <th>Estimated Cost</th>
                  <th>Status</th>
                  <th>Designer</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoms.map(b => {
                  const totalCost = calculateTotalCost(b.items || []);
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.customerName}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Package size={14} style={{ color: '#2563EB' }} />
                          {b.items?.length || 0} Items
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#10B981' }}>₹{totalCost.toLocaleString()}</td>
                      <td><span className="badge badge-completed">{b.status}</span></td>
                      <td>{b.createdByName}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
                          <Calendar size={13} />
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
