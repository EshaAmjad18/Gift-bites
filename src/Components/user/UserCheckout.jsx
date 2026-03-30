
// src/components/user/UserCheckout.jsx
import React, { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { CreditCard, AlertCircle, Lock, Clock } from 'lucide-react';

function UserCheckout({ order, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('50'); // 50 or 100

  const handlePayment = async (paymentPercent) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/payment/initiate', {
        orderId: order._id,
        amount: order.totalAmount || order.total,
        paymentPercent: parseInt(paymentPercent)
      });

      if (response.data.success) {
        if (response.data.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = response.data.paymentUrl;
        } else {
          // Direct success (for testing)
          alert('Payment successful!');
          if (onPaymentSuccess) onPaymentSuccess();
        }
      } else {
        setError(response.data.message || 'Payment initiation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/payment/cash', {
        orderId: order._id
      });

      if (response.data.success) {
        alert('Order confirmed! Please pay at pickup.');
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to confirm cash payment');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '0 auto'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '24px',
      textAlign: 'center'
    },
    orderInfo: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    paymentOptions: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px'
    },
    paymentOption: {
      flex: 1,
      padding: '16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s'
    },
    selectedOption: {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff'
    },
    optionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    optionAmount: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#059669',
      marginBottom: '4px'
    },
    cashOption: {
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b'
    },
    button: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    disabledButton: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    error: {
      padding: '12px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    loading: {
      textAlign: 'center',
      padding: '20px',
      color: '#6b7280'
    }
  };

  const calculateAmount = (percent) => {
    const total = order.totalAmount || order.total || 0;
    return Math.round(total * (percent / 100));
  };

  if (!order) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <AlertCircle size={20} />
          No order selected
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Complete Payment</h2>

      {/* Order Summary */}
      <div style={styles.orderInfo}>
        <div style={styles.infoRow}>
          <span>Order ID:</span>
          <span style={{ fontWeight: 'bold' }}>{order.orderId || order._id?.slice(-6)}</span>
        </div>
        <div style={styles.infoRow}>
          <span>Total Amount:</span>
          <span style={{ fontWeight: 'bold', color: '#059669' }}>
            Rs. {order.totalAmount || order.total || 0}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span>Status:</span>
          <span>{order.status}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.error}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Payment Options */}
      <div style={styles.paymentOptions}>
        <div
          style={{
            ...styles.paymentOption,
            ...(selectedOption === '50' ? styles.selectedOption : {})
          }}
          onClick={() => setSelectedOption('50')}
        >
          <div style={styles.optionTitle}>50% Advance</div>
          <div style={styles.optionAmount}>Rs. {calculateAmount(50)}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Pay now, rest at pickup
          </div>
        </div>

        <div
          style={{
            ...styles.paymentOption,
            ...(selectedOption === '100' ? styles.selectedOption : {})
          }}
          onClick={() => setSelectedOption('100')}
        >
          <div style={styles.optionTitle}>100% Online</div>
          <div style={styles.optionAmount}>Rs. {calculateAmount(100)}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            No payment at pickup
          </div>
        </div>
      </div>

      {/* Cash at Pickup Option */}
      <div
        style={{ ...styles.paymentOption, ...styles.cashOption }}
        onClick={handleCashPayment}
      >
        <div style={{ ...styles.optionTitle, color: '#92400e' }}>
          💵 Cash at Pickup
        </div>
        <div style={{ fontSize: '14px', color: '#92400e' }}>
          Pay full amount when collecting
        </div>
      </div>

      {/* Payment Button */}
      <button
        style={{
          ...styles.button,
          ...(loading ? styles.disabledButton : {})
        }}
        onClick={() => handlePayment(selectedOption)}
        disabled={loading}
      >
        {loading ? (
          'Processing...'
        ) : (
          <>
            <Lock size={20} />
            Pay Rs. {calculateAmount(selectedOption)} Now
          </>
        )}
      </button>

      {/* Security Note */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#065f46'
      }}>
        <Lock size={12} style={{ marginRight: '4px' }} />
        Your payment is secure and encrypted
      </div>
    </div>
  );
}

export default UserCheckout;