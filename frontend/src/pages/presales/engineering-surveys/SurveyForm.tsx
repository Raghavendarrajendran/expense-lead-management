import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createEngineeringSurvey, getSiteInspections } from '../../../api/presales.api';
import { getMasters } from '../../../api/masters.api';
import toast from 'react-hot-toast';

export const SurveyForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const inspection = state?.inspection;

  const [loading, setLoading] = useState(false);
  const [inspectionsList, setInspectionsList] = useState<any[]>([]);
  const [roofTypes, setRoofTypes] = useState<string[]>(['RCC Flat Roof', 'Metal Truss Sheet', 'Asbestos Sheet', 'Ground Mount Area']);

  const [formData, setFormData] = useState({
    leadId: '',
    inspectionRequestId: '',
    customerName: '',
    visitDate: new Date().toISOString().split('T')[0],
    gpsLatitude: '',
    gpsLongitude: '',
    roofType: 'RCC Flat Roof',
    roofSizeInSqFt: 1000,
    shadowIssues: 'None',
    electricalLoad: 5.0,
    transformerAvailable: true,
    gridAvailable: true,
    accessConstraints: '',
    safetyRisks: '',
    engineeringRemarks: '',
    feasibilityStatus: 'Feasible',
  });

  useEffect(() => {
    getSiteInspections()
      .then(res => setInspectionsList(res.data.data))
      .catch(err => console.error(err));

    getMasters()
      .then(res => {
        const m = res.data.data;
        if (m.roofTypes) setRoofTypes(m.roofTypes);
      })
      .catch(err => console.error(err));

    if (inspection) {
      setFormData(prev => ({
        ...prev,
        leadId: inspection.leadId,
        inspectionRequestId: inspection.id,
        customerName: inspection.customerName,
      }));
    }
  }, [inspection]);

  const handleInspectionChange = (inspId: string) => {
    const selected = inspectionsList.find(i => i.id === inspId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        leadId: selected.leadId,
        inspectionRequestId: selected.id,
        customerName: selected.customerName,
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '', inspectionRequestId: '', customerName: '' }));
    }
  };

  const captureGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.loading('Fetching GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss();
        setFormData(prev => ({
          ...prev,
          gpsLatitude: position.coords.latitude.toFixed(6),
          gpsLongitude: position.coords.longitude.toFixed(6),
        }));
        toast.success('GPS coordinates captured successfully');
      },
      (error) => {
        toast.dismiss();
        // Fallback to random Chennai location for demo purposes
        setFormData(prev => ({
          ...prev,
          gpsLatitude: '13.082680',
          gpsLongitude: '80.270718',
        }));
        toast.success('Mock GPS coordinates set (Browser permission denied)');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.inspectionRequestId) {
      toast.error('Please select an active site inspection request');
      return;
    }
    setLoading(true);

    const payload = {
      ...formData,
      gpsLatitude: formData.gpsLatitude ? Number(formData.gpsLatitude) : null,
      gpsLongitude: formData.gpsLongitude ? Number(formData.gpsLongitude) : null,
    };

    try {
      await createEngineeringSurvey(payload);
      toast.success('Feasibility survey report submitted successfully');
      navigate('/presales/inspection-requests');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Fill Feasibility Survey</h1>
          <p className="page-subtitle">Submit rooftop specs, electricity load parameters, and feasibility remarks.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto', padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {!inspection && (
            <div className="form-group">
              <label className="form-label">Select Site Inspection Request *</label>
              <select
                className="form-select"
                required
                value={formData.inspectionRequestId}
                onChange={e => handleInspectionChange(e.target.value)}
              >
                <option value="">-- Choose Inspection Request --</option>
                {inspectionsList.map(i => (
                  <option key={i.id} value={i.id}>{i.customerName} - {i.inspectionPurpose} ({new Date(i.preferredVisitDate).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
          )}

          {inspection && (
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-input" style={{ background: '#F1F5F9', cursor: 'not-allowed' }} readOnly value={formData.customerName} />
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Audit Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.visitDate}
                onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Feasibility Conclusion *</label>
              <select
                className="form-select"
                value={formData.feasibilityStatus}
                onChange={e => setFormData({ ...formData, feasibilityStatus: e.target.value })}
              >
                <option value="Feasible">Feasible</option>
                <option value="Not Feasible">Not Feasible</option>
                <option value="Feasible With Conditions">Feasible With Conditions</option>
              </select>
            </div>
          </div>

          <h3 style={{ margin: '12px 0 0px 0', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Site GPS Location</h3>
          
          <div className="form-grid-3" style={{ alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 13.0826"
                value={formData.gpsLatitude}
                onChange={e => setFormData({ ...formData, gpsLatitude: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 80.2707"
                value={formData.gpsLongitude}
                onChange={e => setFormData({ ...formData, gpsLongitude: e.target.value })}
              />
            </div>
            <div className="form-group">
              <button type="button" className="btn btn-secondary" style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={captureGps}>
                Capture GPS
              </button>
            </div>
          </div>

          <h3 style={{ margin: '12px 0 0px 0', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Site Specifications</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Roof Type *</label>
              <select
                className="form-select"
                value={formData.roofType}
                onChange={e => setFormData({ ...formData, roofType: e.target.value })}
              >
                {roofTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Roof Size (Sq. Ft.) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.roofSizeInSqFt}
                onChange={e => setFormData({ ...formData, roofSizeInSqFt: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Electrical Load Capacity (kW) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                required
                value={formData.electricalLoad}
                onChange={e => setFormData({ ...formData, electricalLoad: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', justifyContent: 'center', height: '100%', paddingBottom: '10px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={formData.transformerAvailable}
                  onChange={e => setFormData({ ...formData, transformerAvailable: e.target.checked })}
                />
                Transformer Ready
              </label>
            </div>
            <div className="form-group" style={{ display: 'flex', justifyContent: 'center', height: '100%', paddingBottom: '10px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={formData.gridAvailable}
                  onChange={e => setFormData({ ...formData, gridAvailable: e.target.checked })}
                />
                Net-Meter Feasible
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Shading Issues (Obstacles, trees, heights)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Detail any structures obstructing sunlight..."
              value={formData.shadowIssues}
              onChange={e => setFormData({ ...formData, shadowIssues: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Access Constraints (Materials delivery)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Crane needed, staircase access only"
                value={formData.accessConstraints}
                onChange={e => setFormData({ ...formData, accessConstraints: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Safety Risks Identified</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Overhead power lines, weak slab structure"
                value={formData.safetyRisks}
                onChange={e => setFormData({ ...formData, safetyRisks: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Design Engineer Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Recommended panel tilt, inverter placement guidelines, structural reinforcements needed..."
              value={formData.engineeringRemarks}
              onChange={e => setFormData({ ...formData, engineeringRemarks: e.target.value })}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Feasibility Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
