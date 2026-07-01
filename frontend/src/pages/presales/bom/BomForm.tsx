import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBom, getPresalesLeads } from '../../../api/presales.api';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const BomForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lead = state?.lead;

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
  });

  const [lineItems, setLineItems] = useState<any[]>([
    { itemCategory: 'Solar Module', itemName: 'Mono PERC Panel', specification: '540 Wp', uom: 'Nos', quantity: 10, unitPrice: 18000, totalPrice: 180000, vendorName: 'Waaree Energies', remarks: '' },
    { itemCategory: 'Inverter', itemName: 'String Inverter 5 kW', specification: '5 kW, Single Phase', uom: 'Nos', quantity: 1, unitPrice: 55000, totalPrice: 55000, vendorName: 'SolarEdge India', remarks: '' }
  ]);

  useEffect(() => {
    getPresalesLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));

    if (lead) {
      setFormData({
        leadId: lead.id,
        customerName: lead.customerName,
      });
    }
  }, [lead]);

  const handleLeadChange = (leadId: string) => {
    const selected = leads.find(l => l.id === leadId);
    if (selected) {
      setFormData({
        leadId,
        customerName: selected.customerName,
      });
    } else {
      setFormData({ leadId: '', customerName: '' });
    }
  };

  const addItemRow = () => {
    setLineItems([
      ...lineItems,
      { itemCategory: 'Electrical', itemName: '', specification: '', uom: 'Nos', quantity: 1, unitPrice: 0, totalPrice: 0, vendorName: '', remarks: '' }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (lineItems.length === 1) {
      toast.error('BOM must contain at least one component item');
      return;
    }
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index][field] = value;

    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity) || 0;
      const p = Number(updated[index].unitPrice) || 0;
      updated[index].totalPrice = q * p;
    }

    setLineItems(updated);
  };

  const calculateTotalBOM = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadId) {
      toast.error('Please select a project lead');
      return;
    }
    setLoading(true);

    try {
      await createBom({
        leadId: formData.leadId,
        customerName: formData.customerName,
        lineItems,
      });
      toast.success('BOM build draft successfully created');
      navigate(`/presales/leads/${formData.leadId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit BOM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-qual-form animate-fade" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Build Bill of Materials (BOM)</h1>
          <p className="page-subtitle">Configure hardware, panel counts, structural cables, and supplier pricing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '20px' }}>
          {!lead && (
            <div className="form-group" style={{ maxWidth: '400px' }}>
              <label>Select Pre-Sales Lead *</label>
              <select
                required
                value={formData.leadId}
                onChange={e => handleLeadChange(e.target.value)}
              >
                <option value="">-- Choose Lead --</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.customerName}</option>
                ))}
              </select>
            </div>
          )}

          {lead && (
            <div className="form-group" style={{ maxWidth: '400px' }}>
              <label>Customer Name</label>
              <input type="text" readOnly value={formData.customerName} />
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Components List</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItemRow}>
              <Plus size={14} style={{ marginRight: '4px' }} /> Add Component
            </button>
          </div>

          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Category *</th>
                  <th style={{ width: '200px' }}>Item Name *</th>
                  <th style={{ width: '150px' }}>Specification</th>
                  <th style={{ width: '80px' }}>UOM</th>
                  <th style={{ width: '80px' }}>Qty *</th>
                  <th style={{ width: '110px' }}>Unit Price (₹) *</th>
                  <th style={{ width: '110px' }}>Total Price (₹)</th>
                  <th style={{ width: '150px' }}>Supplier / Vendor</th>
                  <th style={{ width: '50px' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        value={item.itemCategory}
                        onChange={e => handleItemChange(idx, 'itemCategory', e.target.value)}
                        style={{ padding: '6px', fontSize: '13px' }}
                      >
                        <option value="Solar Module">Solar Module</option>
                        <option value="Inverter">Inverter</option>
                        <option value="Structure">Structure</option>
                        <option value="DC Cable">DC Cable</option>
                        <option value="AC Cable">AC Cable</option>
                        <option value="Earthing">EarthingKit</option>
                        <option value="Electrical Panel">Electrical Panel</option>
                        <option value="Other Accs">Other Accessories</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Copper Wire 4sqmm"
                        value={item.itemName}
                        onChange={e => handleItemChange(idx, 'itemName', e.target.value)}
                        style={{ padding: '6px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="e.g. IEC Certified"
                        value={item.specification}
                        onChange={e => handleItemChange(idx, 'specification', e.target.value)}
                        style={{ padding: '6px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.uom}
                        onChange={e => handleItemChange(idx, 'uom', e.target.value)}
                        style={{ padding: '6px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        style={{ padding: '6px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        style={{ padding: '6px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <strong style={{ fontSize: '14px' }}>₹{(item.totalPrice || 0).toLocaleString()}</strong>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="e.g. Waaree"
                        value={item.vendorName}
                        onChange={e => handleItemChange(idx, 'vendorName', e.target.value)}
                        style={{ padding: '6px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-icon text-danger"
                        onClick={() => removeItemRow(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 700 }}>
              <span>Total BOM Amount: </span>
              <span style={{ color: '#2563EB', marginLeft: '12px' }}>₹{calculateTotalBOM().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={16} style={{ marginRight: '6px' }} /> Save BOM Draft
          </button>
        </div>
      </form>
    </div>
  );
};
