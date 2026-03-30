import React from 'react';

function OrderCard({ order, onStatusChange, onDecision, onWarning }) {
  const statusColors = {
    New: '#2563eb',
    Accepted: '#16a34a',
    Preparing: '#f59e0b',
    Ready: '#22c55e',
    Picked: '#10b981',
    Rejected: '#ef4444',
  };

  return (
    <div style={{
      background: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px'
    }}>
      <h4>
        Order #{order.id} – {order.user}
      </h4>

      {order.items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{item.name} x {item.qty}</span>
          <span>Rs. {item.price * item.qty}</span>
        </div>
      ))}

      <p>
        Advance Paid: <b>{order.advance}%</b>
      </p>

      <p>
        Status:
        <span style={{
          marginLeft: '8px',
          fontWeight: 'bold',
          color: statusColors[order.status]
        }}>
          {order.status}
        </span>
      </p>

      {/* Accept / Reject */}
      {order.status === 'New' && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => onDecision(order.id, 'Accepted')}>Accept</button>
          <button
            onClick={() => onDecision(order.id, 'Rejected')}
            style={{ marginLeft: '10px', background: '#ef4444', color: 'white' }}
          >
            Reject
          </button>
        </div>
      )}

      {/* Status Update */}
      {order.status !== 'Rejected' && order.status !== 'New' && (
        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          style={{ marginTop: '10px' }}
        >
          <option>Accepted</option>
          <option>Preparing</option>
          <option>Ready</option>
          <option>Picked</option>
          <option>Not Picked</option>
        </select>
      )}

      {/* Warning */}
      {order.status === 'Not Picked' && (
        <button
          style={{ marginTop: '10px', background: '#fb8500', color: 'white' }}
          onClick={() => onWarning(order.user)}
        >
          Send Warning
        </button>
      )}
    </div>
  );
}

export default OrderCard;

/**
 * File Description:
 * -----------------
 * Displays a single order with status control, accept/reject, warnings.
 */
