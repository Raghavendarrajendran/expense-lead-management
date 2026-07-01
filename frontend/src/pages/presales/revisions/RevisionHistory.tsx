import React, { useEffect, useState } from 'react';
import { getProposalRevisions } from '../../../api/presales.api';
import { GitBranch, Calendar, User } from 'lucide-react';

export const RevisionHistory = () => {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProposalRevisions()
      .then(res => setRevisions(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Proposal Revisions History</h1>
          <p className="page-subtitle">Track versions history, change specs logs, and reasons for revisions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : revisions.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B' }}>
          No proposal revisions recorded yet.
        </div>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Proposal Ref</th>
                <th>Ver</th>
                <th>Revised By</th>
                <th>Changes Recorded</th>
                <th>Reason for Revision</th>
                <th>Revised Date</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map(rev => (
                <tr key={rev.id}>
                  <td><strong>Proposal: {rev.proposalId}</strong></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2563EB', fontWeight: 600 }}>
                      <GitBranch size={13} /> v{rev.version}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <User size={13} /> {rev.revisedByName}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>Field: <strong>{rev.fieldChanged}</strong></div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Old: {rev.oldValue} ➔ New: {rev.newValue}</div>
                  </td>
                  <td><span style={{ fontSize: '13px' }}>{rev.reason}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
                      <Calendar size={13} /> {new Date(rev.revisedDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
