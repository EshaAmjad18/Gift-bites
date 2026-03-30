//pages/user/PaymentCancel.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

function PaymentCancel() {
  const navigate = useLocation();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const orderId = params.get('order_id');

  return (
    <UserLayout>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '60px 20px',
        textAlign: 'center'
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
          fontSize: '40px',
          margin: '0 auto 30px'
        }}>
          <XCircle size={40} />
        </div>
        
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Payment Cancelled
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Your payment was cancelled. No charges were made.
        </p>
        
        {orderId && (
          <p style={{ 
            fontSize: '16px', 
            color: '#9ca3af',
            marginBottom: '30px'
          }}>
            Order ID: {orderId}
          </p>
        )}
        
        <div style={{
          padding: '20px',
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          marginBottom: '30px',
          borderLeft: '4px solid #d97706'
        }}>
          <p style={{ color: '#92400e', margin: 0 }}>
            <strong>Note:</strong> Your order is saved as draft. You can complete the payment later from your orders page.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => navigate('/user/cart')}
            style={{
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
            }}
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
          
          <button
            onClick={() => navigate('/user/orders')}
            style={{
              padding: '16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <ShoppingCart size={20} />
            View Orders
          </button>
        </div>
        
        <p style={{
          marginTop: '30px',
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: '1.6'
        }}>
          Need help? Contact cafeteria staff for payment assistance.
        </p>
      </div>
    </UserLayout>
  );
}

export default PaymentCancel;