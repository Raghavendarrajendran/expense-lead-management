import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLead } from '../../api/leads.api';
import { getUsers } from '../../api/users.api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateLead = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    customerType: 'Residential',
    requirementType: 'Rooftop Solar',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    electricityBillAmount: 0,
    expectedSolarCapacity: '',
    leadSource: 'Website',
    assignedExecutiveId: '',
    assignedExecutiveName: '',
    followUpDate: '',
    remarks: '',
  });

  useEffect(() => {
    getUsers({ roleId: 'role_field_executive' })
      .then(res => setExecutives(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'electricityBillAmount' ? Number(value) : value,
    }));
  };

  const handleExecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const execId = e.target.value;
    const exec = executives.find(u => u.id === execId);
    setFormData(prev => ({
      ...prev,
      assignedExecutiveId: execId,
      assignedExecutiveName: exec ? exec.name : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        createdByName: user?.name,
        // Backend handles remark structure
      };
      await createLead(dataToSubmit);
      toast.success('Lead created successfully');
      navigate('/leads');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-lead animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads')}>
          <ArrowLeft size={14} /> Back to Leads
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Create New Lead</h1>
          <p className="page-subtitle">Add a solar customer prospect into the portal.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Customer Contact Info
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Name <span className="required">*</span></label>
              <input
                type="text"
                name="customerName"
                className="form-input"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mobile Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="mobile"
                  className="form-input"
                  placeholder="Enter 10-digit number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px', fontWeight: 700 }}>
            Solar Requirement Details
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select name="customerType" className="form-select" value={formData.customerType} onChange={handleChange}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Requirement Type</label>
              <select name="requirementType" className="form-select" value={formData.requirementType} onChange={handleChange}>
                <option value="Rooftop Solar">Rooftop Solar</option>
                <option value="Ground Mounted">Ground Mounted</option>
                <option value="Water Pump">Water Pump</option>
                <option value="EV Charging">EV Charging</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Average Electricity Bill (₹)</label>
              <input
                type="number"
                name="electricityBillAmount"
                className="form-input"
                placeholder="3500"
                value={formData.electricityBillAmount || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Capacity (e.g. 5 kW)</label>
              <input
                type="text"
                name="expectedSolarCapacity"
                className="form-input"
                placeholder="5 kW"
                value={formData.expectedSolarCapacity}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lead Source</label>
              <select name="leadSource" className="form-select" value={formData.leadSource} onChange={handleChange}>
                <option value="Website">Website</option>
                <option value="Reference">Reference</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px', fontWeight: 700 }}>
            Site Location Details
          </h3>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              placeholder="Door No, Street Name"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                className="form-input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                className="form-input"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px', fontWeight: 700 }}>
            Assignment & Follow-up
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Assign Executive</label>
              <select name="assignedExecutiveId" className="form-select" value={formData.assignedExecutiveId} onChange={handleExecChange}>
                <option value="">Leave Unassigned</option>
                {executives.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Next Follow-up Date</label>
              <input
                type="date"
                name="followUpDate"
                className="form-input"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/leads')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
