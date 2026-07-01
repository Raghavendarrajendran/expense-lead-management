import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../../../api/presales.api';
import { Plus, Download, ShoppingBag, CreditCard } from 'lucide-react';

export const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(res => setOrders(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Handover & Orders</h1>
          <p className="page-subtitle">Finalize purchase orders and hand over design requirements to post-sales execution.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate('/presales/orders/new')}>
            <Plus size={16} /> Finalize Order
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B' }}>
          No purchase orders finalized yet.
        </div>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>PO Number</th>
                <th>PO Date</th>
                <th>Order Value</th>
                <th>Attachment</th>
                <th>Status</th>
                <th>Advance Milestones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.customerName}</strong><div style={{ fontSize: '11px', color: '#64748B' }}>Ref: {order.proposalId}</div></td>
                  <td>{order.poNumber}</td>
                  <td>{new Date(order.poDate).toLocaleDateString()}</td>
                  <td><strong>₹{(order.finalOrderValue || 0).toLocaleString()}</strong></td>
                  <td>
                    {order.poUpload ? (
                      <span style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                        <Download size={13} /> {order.poUpload}
                      </span>
                    ) : '-'}
                  </td>
                  <td><span className="badge badge-completed">{order.orderStatus}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-xs" onClick={() => navigate('/presales/payments', { state: { orderId: order.id } })}>
                      <CreditCard size={11} style={{ marginRight: '3px' }} /> View Milestones
                    </button>
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
