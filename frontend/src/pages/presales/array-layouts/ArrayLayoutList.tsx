import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArrayLayouts } from '../../../api/presales.api';
import { Plus, Zap, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const ArrayLayoutList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [orientation, setOrientation] = useState('');

  useEffect(() => {
    getArrayLayouts()
      .then(res => setLayouts(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLayouts = layouts.filter(l => {
    const matchesSearch = l.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      l.panelType?.toLowerCase().includes(search.toLowerCase()) ||
      l.inverterType?.toLowerCase().includes(search.toLowerCase()) ||
      l.createdByName?.toLowerCase().includes(search.toLowerCase());

    const matchesOrientation = !orientation || l.orientation === orientation;

    return matchesSearch && matchesOrientation;
  });

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Array Design Layouts</h1>
          <p className="page-subtitle">Rooftop panel layout calculations and solar cell orientation designs.</p>
        </div>
        {hasPermission('mod_ps_array', 'create') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/presales/array-layouts/new')}>
              <Plus size={16} /> Create Array Layout
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
                placeholder="Search by customer, panels, engineer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <select className="filter-select" value={orientation} onChange={e => setOrientation(e.target.value)}>
                <option value="">All Orientations</option>
                <option value="South">South</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          {filteredLayouts.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B', border: 'none' }}>
              No array layout designs matching your filters.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Capacity (kWp)</th>
                  <th>Panels Specs</th>
                  <th>Tilt & Orientation</th>
                  <th>Inverter</th>
                  <th>Designer</th>
                </tr>
              </thead>
              <tbody>
                {filteredLayouts.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.customerName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Zap size={14} style={{ color: '#EAB308' }} />
                        {l.plantCapacity} kWp
                      </div>
                    </td>
                    <td>
                      <div>{l.panelCount} Panels</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{l.panelType}</div>
                    </td>
                    <td>
                      <div>{l.orientation}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Tilt: {l.tiltAngle}°</div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{l.inverterType}</td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>{l.createdByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
