import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSiteInspection, getEngineeringSurveys } from '../../../api/presales.api';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, User, ShieldAlert, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const [inspection, setInspection] = useState<any>(null);
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const insRes = await getSiteInspection(id!);
        setInspection(insRes.data.data);

        const survRes = await getEngineeringSurveys({ leadId: insRes.data.data.leadId });
        const surveysList = survRes.data.data;
        // find survey matching inspection request
        const matchingSurvey = surveysList.find((s: any) => s.inspectionRequestId === id);
        if (matchingSurvey) setSurvey(matchingSurvey);
      } catch (err: any) {
        toast.error('Failed to load inspection details');
        navigate('/presales/inspection-requests');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !inspection) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="inspection-detail animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/presales/inspection-requests')}>
          <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back to Inspections List
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Inspection: {inspection.customerName}</h1>
          <p className="page-subtitle">Schedule audits and review feasibility data.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          {hasPermission('mod_ps_inspection_req', 'change_status') && (
            <button className="btn btn-secondary" onClick={() => navigate(`/presales/inspection-requests/${inspection.id}/edit`)}>
              Edit Request
            </button>
          )}
          {hasPermission('mod_ps_engineering', 'perform_inspection') && inspection.status !== 'Completed' && (
            <button className="btn btn-primary" onClick={() => navigate('/presales/engineering-surveys/new', { state: { inspection } })}>
              <CheckCircle size={14} style={{ marginRight: '6px' }} /> Fill Feasibility Survey
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Audit Request Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Address Location</span>
              <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <MapPin size={14} style={{ color: '#64748B' }} /> {inspection.siteAddress}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Preferred Visit Date</span>
              <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Calendar size={14} style={{ color: '#64748B' }} /> {new Date(inspection.preferredVisitDate).toLocaleDateString()}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Assigned Design Engineer</span>
              <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <User size={14} style={{ color: '#64748B' }} /> {inspection.assignedEngineerName || 'Not Assigned'}
              </strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Audit Scope</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Instructions / Objective</span>
              <p style={{ fontSize: '14px', background: '#F8FAFC', padding: '10px', borderRadius: '4px', marginTop: '4px' }}>
                {inspection.inspectionPurpose}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Priority</span>
                <span className="badge badge-scheduled" style={{ marginTop: '4px', display: 'inline-block' }}>{inspection.priority}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Current Status</span>
                <span className="badge badge-completed" style={{ marginTop: '4px', display: 'inline-block' }}>{inspection.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {survey && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle style={{ color: '#10B981' }} /> Feasibility Survey Result
          </h3>
          <div className="grid-cols-2" style={{ gap: '20px' }}>
            <div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Roof Specifications</span>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{survey.roofType} ({survey.roofSizeInSqFt} Sq Ft area)</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Electrical Specifications</span>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Transformer: {survey.transformerAvailable ? 'Yes' : 'No'} | Grid connection: {survey.gridAvailable ? 'Yes' : 'No'} | Max Load: {survey.electricalLoad} kW</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Access & Safety risks</span>
                <div style={{ fontSize: '13px' }}>Access: {survey.accessConstraints || 'No constraints'}</div>
                <div style={{ fontSize: '13px' }}>Safety: {survey.safetyRisks || 'Standard site risks'}</div>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Feasibility Status</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: survey.feasibilityStatus === 'Feasible' ? '#10B981' : '#F59E0B' }}>
                  {survey.feasibilityStatus}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Surveyor Remarks</span>
                <p style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', padding: '10px', borderRadius: '4px', fontSize: '13px' }}>
                  {survey.engineeringRemarks}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
