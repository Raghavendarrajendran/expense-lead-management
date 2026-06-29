import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSiteVisit, updateSiteVisit } from '../../api/siteVisits.api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Edit, MapPin, Check, Camera, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const SiteVisitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit fields
  const [feasibility, setFeasibility] = useState('Pending Assessment');
  const [remarks, setRemarks] = useState('');
  const [roofType, setRoofType] = useState('');
  const [roofArea, setRoofArea] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);

  // File states (mocking uploads as Base64 strings for POC)
  const [roofPhoto, setRoofPhoto] = useState<string>('');
  const [meterPhoto, setMeterPhoto] = useState<string>('');
  const [billPhoto, setBillPhoto] = useState<string>('');

  const fetchVisit = () => {
    if (!id) return;
    setLoading(true);
    getSiteVisit(id)
      .then(res => {
        const data = res.data.data;
        setVisit(data);
        setFeasibility(data.feasibilityStatus || 'Pending Assessment');
        setRemarks(data.surveyRemarks || '');
        setRoofType(data.roofType || '');
        setRoofArea(data.roofArea || '');
        setObstacles(data.shadowObstacleDetails || '');
        setLat(data.gpsLatitude || 0);
        setLng(data.gpsLongitude || 0);
        setRoofPhoto(data.roofPhotoUrl || '');
        setMeterPhoto(data.meterPhotoUrl || '');
        setBillPhoto(data.electricityBillUrl || '');
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisit();
  }, [id]);

  const handleCaptureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(parseFloat(pos.coords.latitude.toFixed(6)));
          setLng(parseFloat(pos.coords.longitude.toFixed(6)));
          toast.success('GPS coordinates captured!');
        },
        () => {
          // Fallback mockup coordinate
          setLat(13.082712);
          setLng(80.270723);
          toast.success('Mock GPS coordinates captured!');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'roof') setRoofPhoto(reader.result as string);
      if (type === 'meter') setMeterPhoto(reader.result as string);
      if (type === 'bill') setBillPhoto(reader.result as string);
      toast.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateSiteVisit(id, {
        feasibilityStatus: feasibility,
        surveyRemarks: remarks,
        roofType,
        roofArea,
        shadowObstacleDetails: obstacles,
        gpsLatitude: lat,
        gpsLongitude: lng,
        roofPhotoUrl: roofPhoto,
        meterPhotoUrl: meterPhoto,
        electricityBillUrl: billPhoto,
        status: 'Completed',
      });
      toast.success('Site survey updated successfully');
      setEditing(false);
      fetchVisit();
    } catch (err: any) {
      toast.error('Failed to update site visit');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!visit) {
    return <div className="card">Site survey not found.</div>;
  }

  const canEdit = hasPermission('mod_site_visits', 'edit') &&
    (user?.role?.name !== 'field_executive' || visit.assignedExecutiveId === user.id);

  return (
    <div className="site-visit-detail animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/site-visits')}>
          <ArrowLeft size={14} /> Back to Site Surveys
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Site Survey: {visit.customerName}</h1>
          <p className="page-subtitle">Visit Reference ID: {visit.id} | Scheduled: {visit.visitDate} {visit.visitTime}</p>
        </div>
        {canEdit && !editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <Edit size={14} /> Update Survey Details
          </button>
        )}
      </div>

      <div className="grid-cols-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          {editing ? (
            <form onSubmit={handleSave} className="login-form">
              <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
                Feasibility & Assessment
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Feasibility Status</label>
                  <select className="form-select" value={feasibility} onChange={e => setFeasibility(e.target.value)}>
                    <option value="Feasible">Feasible</option>
                    <option value="Partially Feasible">Partially Feasible</option>
                    <option value="Not Feasible">Not Feasible</option>
                    <option value="Pending Assessment">Pending Assessment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">GPS Location</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={lat && lng ? `${lat}, ${lng}` : 'Not Captured'}
                      readOnly
                    />
                    <button type="button" className="btn btn-navy btn-sm" onClick={handleCaptureGPS}>
                      Capture GPS
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Roof Type</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. RCC Flat, Tiled, Metal Sheet"
                    value={roofType}
                    onChange={e => setRoofType(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Roof Area (sq ft)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 500 sq ft"
                    value={roofArea}
                    onChange={e => setRoofArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shadow / Obstacle Details</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Shading from neighboring building, trees..."
                  value={obstacles}
                  onChange={e => setObstacles(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Survey Remarks</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add any specific observations..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px', fontWeight: 700 }}>
                Photo Uploads (Simulation)
              </h3>
              <div className="form-grid-3">
                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label className="form-label">Roof Photo</label>
                  <div style={{ border: '1px dashed var(--color-border)', padding: '16px', borderRadius: '8px' }}>
                    {roofPhoto ? (
                      <img src={roofPhoto} alt="Roof Preview" style={{ height: '80px', margin: '0 auto 8px', objectFit: 'cover' }} />
                    ) : (
                      <Camera size={24} style={{ margin: '0 auto 8px', color: 'var(--color-text-muted)' }} />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'roof')} style={{ display: 'none' }} id="roof-upload" />
                    <label htmlFor="roof-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>Select File</label>
                  </div>
                </div>

                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label className="form-label">Meter Photo</label>
                  <div style={{ border: '1px dashed var(--color-border)', padding: '16px', borderRadius: '8px' }}>
                    {meterPhoto ? (
                      <img src={meterPhoto} alt="Meter Preview" style={{ height: '80px', margin: '0 auto 8px', objectFit: 'cover' }} />
                    ) : (
                      <Camera size={24} style={{ margin: '0 auto 8px', color: 'var(--color-text-muted)' }} />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'meter')} style={{ display: 'none' }} id="meter-upload" />
                    <label htmlFor="meter-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>Select File</label>
                  </div>
                </div>

                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label className="form-label">Electricity Bill</label>
                  <div style={{ border: '1px dashed var(--color-border)', padding: '16px', borderRadius: '8px' }}>
                    {billPhoto ? (
                      <img src={billPhoto} alt="Bill Preview" style={{ height: '80px', margin: '0 auto 8px', objectFit: 'cover' }} />
                    ) : (
                      <FileText size={24} style={{ margin: '0 auto 8px', color: 'var(--color-text-muted)' }} />
                    )}
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'bill')} style={{ display: 'none' }} id="bill-upload" />
                    <label htmlFor="bill-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>Select File</label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Complete Survey
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
                Feasibility Status: <span style={{ color: visit.feasibilityStatus === 'Feasible' ? 'var(--color-success)' : 'var(--color-primary)' }}>{visit.feasibilityStatus}</span>
              </h3>

              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>GPS Location</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <MapPin size={14} color="var(--color-primary)" />
                    {visit.gpsLatitude && visit.gpsLongitude ? `${visit.gpsLatitude}, ${visit.gpsLongitude}` : 'Not Captured'}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Roof Specifications</div>
                  <div style={{ fontWeight: 500 }}>
                    Type: {visit.roofType || 'Not specified'} | Area: {visit.roofArea || 'Not specified'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Shadow / Obstacle Details</div>
                <div style={{ fontWeight: 500 }}>{visit.shadowObstacleDetails || 'No shading issues recorded.'}</div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Survey Remarks</div>
                <div style={{ padding: '12px', background: 'var(--color-surface-2)', borderRadius: '8px', fontStyle: 'italic' }}>
                  "{visit.surveyRemarks || 'No remarks added yet.'}"
                </div>
              </div>

              <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
                Uploaded Attachments
              </h3>
              <div className="form-grid-3">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Roof Photo</div>
                  {visit.roofPhotoUrl ? (
                    <img src={visit.roofPhotoUrl} alt="Roof" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ height: '140px', background: 'var(--color-surface-2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      No Photo Uploaded
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Meter Photo</div>
                  {visit.meterPhotoUrl ? (
                    <img src={visit.meterPhotoUrl} alt="Meter" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ height: '140px', background: 'var(--color-surface-2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      No Photo Uploaded
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Electricity Bill</div>
                  {visit.electricityBillUrl ? (
                    <img src={visit.electricityBillUrl} alt="Electricity Bill" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ height: '140px', background: 'var(--color-surface-2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      No Bill Uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lead Reference Details */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Survey Reference
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</div>
              <div style={{ fontWeight: 600 }}>{visit.customerName}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Executive</div>
              <div style={{ fontWeight: 500 }}>{visit.assignedExecutiveName}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Address</div>
              <div style={{ fontWeight: 500 }}>{visit.siteAddress}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
              <span className={`badge ${visit.status === 'Completed' ? 'badge-completed' : 'badge-scheduled'}`}>
                {visit.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
