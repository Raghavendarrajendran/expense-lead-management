import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense } from '../../api/expenses.api';
import { getLeads } from '../../api/leads.api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export const SubmitExpense = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState<'Petrol Bill' | 'Bus Ticket' | 'Auto/Cab' | 'Food' | 'Parking' | 'Toll' | 'Lodging' | 'Mobile Recharge' | 'Miscellaneous'>('Petrol Bill');
  const [amount, setAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState('');
  const [leadId, setLeadId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [purposeOfVisit, setPurposeOfVisit] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Other'>('Cash');
  const [remarks, setRemarks] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Petrol Specific
  const [vehicleNo, setVehicleNo] = useState('');
  const [openKm, setOpenKm] = useState<number>(0);
  const [closeKm, setCloseKm] = useState<number>(0);
  const [pumpName, setPumpName] = useState('');
  const [billNo, setBillNo] = useState('');

  // Bus Specific
  const [travelDate, setTravelDate] = useState('');

  useEffect(() => {
    getLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setLeadId(id);
    const l = leads.find(x => x.id === id);
    setCustomerName(l ? l.customerName : '');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptUrl(reader.result as string);
      toast.success('Receipt photo attached!');
    };
    reader.readAsDataURL(file);
  };

  const handleCalculateKm = (c: number) => {
    setCloseKm(c);
    const diff = c - openKm;
    if (diff > 0) {
      // Automatic approximation of petrol amount for Field Executives: e.g. Rs. 4 per KM rate
      setAmount(diff * 4);
    }
  };

  const handleSubmit = async (submitImmediate: boolean) => {
    if (!expenseDate || !amount) {
      toast.error('Date and Amount are required');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        category,
        amount,
        expenseDate,
        leadId: leadId || undefined,
        customerName: customerName || undefined,
        fromLocation,
        toLocation,
        purposeOfVisit,
        paymentMode,
        remarks,
        receiptUrl: receiptUrl || undefined,
        status: submitImmediate ? 'Submitted' : 'Draft',
        executiveName: user?.name,
      };

      if (category === 'Petrol Bill') {
        payload.vehicleNumber = vehicleNo;
        payload.openingKm = openKm;
        payload.closingKm = closeKm;
        payload.totalKm = closeKm - openKm;
        payload.petrolPumpName = pumpName;
        payload.billNumber = billNo;
      } else if (category === 'Bus Ticket') {
        payload.travelDate = travelDate;
        payload.travelPurpose = purposeOfVisit;
      }

      await createExpense(payload);
      toast.success(submitImmediate ? 'Expense submitted for approval!' : 'Expense saved as draft');
      navigate('/expenses');
    } catch (err: any) {
      toast.error('Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-expense animate-fade">
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/expenses')}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Submit Field Expense</h1>
          <p className="page-subtitle">Submit receipts for petrol, lodging, bus tickets, food, etc.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={e => e.preventDefault()} className="login-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Expense Category <span className="required">*</span></label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                required
              >
                <option value="Petrol Bill">Petrol Bill</option>
                <option value="Bus Ticket">Bus Ticket</option>
                <option value="Auto/Cab">Auto/Cab</option>
                <option value="Food">Food</option>
                <option value="Parking">Parking</option>
                <option value="Toll">Toll</option>
                <option value="Lodging">Lodging</option>
                <option value="Mobile Recharge">Mobile Recharge</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expense Date <span className="required">*</span></label>
              <input
                type="date"
                className="form-input"
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ── PETROL BILL FIELDS ── */}
          {category === 'Petrol Bill' && (
            <div style={{ background: 'var(--color-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', margin: '12px 0' }}>
              <h4 style={{ marginBottom: '12px', fontWeight: 700 }}>Petrol Specifications</h4>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input type="text" className="form-input" placeholder="TN09AX1234" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Opening KM</label>
                  <input type="number" className="form-input" placeholder="24500" value={openKm || ''} onChange={e => setOpenKm(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Closing KM</label>
                  <input type="number" className="form-input" placeholder="24545" value={closeKm || ''} onChange={e => handleCalculateKm(Number(e.target.value))} />
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Petrol Pump Name</label>
                  <input type="text" className="form-input" placeholder="HP Petrol Pump, Anna Nagar" value={pumpName} onChange={e => setPumpName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bill Number</label>
                  <input type="text" className="form-input" placeholder="HP20240701" value={billNo} onChange={e => setBillNo(e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                Total Distance Travelled: {closeKm - openKm > 0 ? `${closeKm - openKm} KM` : '0 KM'}
              </div>
            </div>
          )}

          {/* ── BUS TICKET FIELDS ── */}
          {category === 'Bus Ticket' && (
            <div style={{ background: 'var(--color-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', margin: '12px 0' }}>
              <h4 style={{ marginBottom: '12px', fontWeight: 700 }}>Bus Journey Specifications</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Travel Date</label>
                  <input type="date" className="form-input" value={travelDate} onChange={e => setTravelDate(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Total Amount (₹) <span className="required">*</span></label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Associated Lead Reference</label>
              <select className="form-select" value={leadId} onChange={handleLeadChange}>
                <option value="">None / Independent visit</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.customerName} ({l.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">From Location</label>
              <input type="text" className="form-input" placeholder="Office / Chennai" value={fromLocation} onChange={e => setFromLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">To Location</label>
              <input type="text" className="form-input" placeholder="Anna Nagar / Site" value={toLocation} onChange={e => setToLocation(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Purpose of Visit</label>
            <input type="text" className="form-input" placeholder="e.g. Site visit inspection" value={purposeOfVisit} onChange={e => setPurposeOfVisit(e.target.value)} />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select className="form-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value as any)}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Receipt File Upload</label>
              <div style={{ border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
                {receiptUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <img src={receiptUrl} alt="Receipt" style={{ height: '40px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '12px' }}>Receipt Attached</span>
                  </div>
                ) : (
                  <div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="receipt-upload" />
                    <label htmlFor="receipt-upload" style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}>
                      <Upload size={14} style={{ marginRight: '6px' }} /> Upload Receipt Photo
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea className="form-textarea" placeholder="Remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/expenses')}>Cancel</button>
            <button type="button" className="btn btn-navy" onClick={() => handleSubmit(false)} disabled={loading}>
              Save as Draft
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleSubmit(true)} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
