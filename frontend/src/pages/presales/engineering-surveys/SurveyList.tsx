import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEngineeringSurveys } from '../../../api/presales.api';
import { Plus, Eye, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const SurveyList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [feasibilityStatus, setFeasibilityStatus] = useState('');

  useEffect(() => {
    getEngineeringSurveys()
      .then(res => setSurveys(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getFeasibilityBadge = (status: string) => {
    switch (status) {
      case 'Feasible':
        return <span className="badge badge-completed">Feasible</span>;
      case 'Not Feasible':
        return <span className="badge badge-lost">Not Feasible</span>;
      default:
        return <span className="badge badge-contacted">Feasible with Conditions</span>;
    }
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.engineerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.roofType?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !feasibilityStatus || s.feasibilityStatus === feasibilityStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Feasibility Engineering Surveys</h1>
          <p className="page-subtitle">Rooftop parameters, shadow calculations, and load assessment records.</p>
        </div>
        {hasPermission('mod_ps_engineering', 'perform_inspection') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/presales/engineering-surveys/new')}>
              <Plus size={16} /> Fill Feasibility Survey
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
                placeholder="Search by customer, engineer, roof type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <select className="filter-select" value={feasibilityStatus} onChange={e => setFeasibilityStatus(e.target.value)}>
                <option value="">All Conclusions</option>
                <option value="Feasible">Feasible</option>
                <option value="Not Feasible">Not Feasible</option>
                <option value="Feasible With Conditions">Feasible With Conditions</option>
              </select>
            </div>
          </div>

          {filteredSurveys.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B', border: 'none' }}>
              No engineering surveys matching your filters.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Survey Date</th>
                  <th>Roof Details</th>
                  <th>Electrical Load</th>
                  <th>Conclusion</th>
                  <th>Engineer Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.customerName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Calendar size={13} style={{ color: '#64748B' }} />
                        {new Date(s.visitDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.roofType}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Size: {s.roofSizeInSqFt} Sq. Ft.</div>
                    </td>
                    <td>{s.electricalLoad} kW</td>
                    <td>{getFeasibilityBadge(s.feasibilityStatus)}</td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>{s.engineerName}</td>
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
