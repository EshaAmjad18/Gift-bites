
// src/components/user/OrderStatusCard.jsx
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Truck, CreditCard } from 'lucide-react';

function OrderStatusCard({ order, onClick }) {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e', icon: <Clock size={16} /> };
      case 'accepted': 
      case 'confirmed': return { bg: '#dbeafe', text: '#1e40af', icon: <CheckCircle size={16} /> };
      case 'preparing': 
      case 'processing': return { bg: '#fef3c7', text: '#92400e', icon: <Clock size={16} /> };
      case 'ready': return { bg: '#d1fae5', text: '#065f46', icon: <CheckCircle size={16} /> };
      case 'completed': return { bg: '#d1fae5', text: '#065f46', icon: <CheckCircle size={16} /> };
      case 'cancelled': 
      case 'canceled': return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={16} /> };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={16} /> };
      default: return { bg: '#e5e7eb', text: '#374151', icon: <AlertCircle size={16} /> };
    }
  };

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'Order Placed';
      case 'accepted': return 'Order Accepted';
      case 'preparing': return 'Preparing Your Order';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return status || 'Unknown';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const styles = {
    card: { 
      background: 'white', 
      padding: '20px', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      marginBottom: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      ':hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)'
      }
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    orderId: {
      fontWeight: 'bold', 
      fontSize: '16px', 
      color: '#1f2937'
    },
    time: {
      fontSize: '14px',
      color: '#6b7280'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    itemsSection: {
      marginBottom: '16px'
    },
    item: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginBottom: '6px',
      fontSize: '14px'
    },
    itemName: {
      color: '#4b5563'
    },
    itemPrice: {
      color: '#059669',
      fontWeight: '500'
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '12px',
      borderTop: '1px solid #e5e7eb'
    },
    total: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    paymentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: '#6b7280'
    },
    pickupTime: {
      fontSize: '13px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '8px'
    }
  };

  const statusColors = getStatusColor(order.status);
  const orderId = order.orderId || order._id?.slice(-6).toUpperCase();

  return (
    <div style={styles.card} onClick={onClick}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.orderId}>Order #{orderId}</div>
          <div style={styles.time}>
            {order.createdAt ? formatTime(order.createdAt) : 'N/A'}
          </div>
        </div>
        <div style={{ ...styles.statusBadge, ...statusColors }}>
          {statusColors.icon}
          {getStatusText(order.status)}
        </div>
      </div>

      {/* Items */}
      <div style={styles.itemsSection}>
        {order.items?.slice(0, 2).map((item, index) => (
          <div key={index} style={styles.item}>
            <span style={styles.itemName}>
              {item.quantity}x {item.name || item.item?.name || 'Item'}
            </span>
            <span style={styles.itemPrice}>
              Rs. {(item.price || 0) * (item.quantity || 1)}
            </span>
          </div>
        ))}
        {order.items && order.items.length > 2 && (
          <div style={{ ...styles.item, color: '#6b7280', fontSize: '12px' }}>
            + {order.items.length - 2} more items
          </div>
        )}
      </div>

      {/* Pickup Time */}
      {order.pickupTime && (
        <div style={styles.pickupTime}>
          <Clock size={12} />
          Pickup: {formatTime(order.pickupTime)}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.total}>Rs. {order.totalAmount || order.total || 0}</div>
        <div style={styles.paymentInfo}>
          {order.paymentMethod === 'online' ? (
            <CreditCard size={12} />
          ) : (
            '💵'
          )}
          {order.paymentMethod === 'online' ? 'Online' : 
           order.paymentMethod === 'partial' ? '50% Advance' : 
           'Cash at Pickup'}
        </div>
      </div>
    </div>
  );
}

export default OrderStatusCard;