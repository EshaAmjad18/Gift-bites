
// pages/user/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { CheckCircle, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import axios from '../../utils/axiosInstance';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    console.log('Payment Success Page - Params:', {
      sessionId,
      orderId,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (sessionId && orderId) {
      // Update order payment status in database
      updateOrderPayment(orderId, sessionId);
    } else {
      // No session ID - probably cancelled
      setStatus('cancelled');
    }
  }, [searchParams]);

  const updateOrderPayment = async (orderId, sessionId) => {
    try {
      console.log('Updating payment for order:', orderId);
      
      // Call backend API to update payment status
      const response = await axios.put(`/api/user/orders/${orderId}/update-payment`, {
        sessionId: sessionId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        // console.log('✅ Database updated successfully');
        setStatus('success');
        setOrderInfo({
          ...response.data.order,
          message: 'Payment completed successfully!'
        });

        // Redirect after 5 seconds
        const timer = setTimeout(() => {
          navigate('/user/orders');
        }, 5000);

        return () => clearTimeout(timer);
      } else {
        setError(response.data.message || 'Failed to update order');
        setStatus('error');
      }
    } catch (error) {
      console.error('❌ Update failed:', error);
      setError(error.response?.data?.message || error.message || 'Network error');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <UserLayout>
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            margin: '0 auto 30px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>
            Verifying Payment...
          </h2>
          <p style={{ color: '#6b7280' }}>
            Please wait while we confirm and update your payment
          </p>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginTop: '20px',
            backgroundColor: '#f3f4f6',
            padding: '10px',
            borderRadius: '8px'
          }}>
            Updating database...
          </div>
        </div>
      </UserLayout>
    );
  }

  if (status === 'error') {
    return (
      <UserLayout>
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px'
          }}>
            <AlertCircle size={48} />
          </div>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            Update Failed
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {error || 'Failed to update payment status'}
          </p>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '14px',
            marginBottom: '30px',
            backgroundColor: '#f3f4f6',
            padding: '12px',
            borderRadius: '8px'
          }}>
            Note: Payment was successful on Stripe but database update failed.
            Contact cafeteria staff with Order ID.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/user/orders')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Go to Orders
            </button>
            
            <button
              onClick={() => navigate('/user/menu')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (status === 'cancelled') {
    return (
      <UserLayout>
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px'
          }}>
            <RefreshCw size={48} />
          </div>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            Payment Cancelled
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            Your payment was not completed. No charges were made.
          </p>
          <button
            onClick={() => navigate('/user/menu')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Back to Menu
          </button>
        </div>
      </UserLayout>
    );
  }

  // SUCCESS SCREEN
  return (
    <UserLayout>
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px'
        }}>
          <CheckCircle size={64} />
        </div>
        
        <h1 style={{ 
          fontSize: '32px', 
          color: '#047857',
          marginBottom: '16px'
        }}>
          Payment Successful! 🎉
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          Your order has been confirmed and is now pending staff acceptance.
        </p>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid #a7f3d0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <ShoppingBag size={24} color="#059669" />
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
              Order #{orderInfo?.orderNumber || 'Placed Successfully'}
            </span>
          </div>
          
          {orderInfo && (
            <div style={{ 
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#d1fae5',
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Status:</strong> {orderInfo.status || 'Pending Staff Acceptance'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Payment:</strong> {orderInfo.paymentStatus || 'Paid'}
              </div>
              <div>
                <strong>Amount:</strong> Rs. {orderInfo.totalAmount || 'N/A'}
              </div>
            </div>
          )}
          
          <p style={{ color: '#047857', margin: '15px 0 0 0' }}>
            Database updated successfully ✓
          </p>
        </div>
        
        {/* Progress Bar */}
        <div style={{ 
          height: '6px', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '3px',
          margin: '40px 0 20px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#10b981',
            width: '100%',
            animation: 'countdown 5s linear forwards'
          }}></div>
        </div>
        
        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
          Redirecting to orders page in 5 seconds...
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/user/orders')}
            style={{
              padding: '12px 28px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Go to My Orders
          </button>
          
          <button
            onClick={() => navigate('/user/menu')}
            style={{
              padding: '12px 28px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Back to Menu
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes countdown {
            0% { width: 100%; }
            100% { width: 0%; }
          }
        `}
      </style>
    </UserLayout>
  );
}

export default PaymentSuccess;