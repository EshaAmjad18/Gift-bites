

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, 
         Truck, CreditCard, Package, User, Phone, MapPin, 
         Calendar, DollarSign, RefreshCw } from 'lucide-react';
import axios from '../../utils/axiosInstance';

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/user/orders/${orderId}`);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError(response.data.message || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending_payment': 
        return { 
          text: 'Pending Payment', 
          color: '#f59e0b', 
          bg: '#fef3c7',
          icon: <Clock size={20} />,
          description: 'Waiting for payment confirmation'
        };
      case 'pending_staff': 
        return { 
          text: 'Pending Staff Acceptance', 
          color: '#f59e0b', 
          bg: '#fef3c7',
          icon: <Clock size={20} />,
          description: 'Waiting for cafeteria staff to accept order'
        };
      case 'accepted': 
        return { 
          text: 'Order Accepted', 
          color: '#3b82f6', 
          bg: '#dbeafe',
          icon: <CheckCircle size={20} />,
          description: 'Order accepted and will be prepared soon'
        };
      case 'preparing': 
        return { 
          text: 'Preparing', 
          color: '#8b5cf6', 
          bg: '#ede9fe',
          icon: <Package size={20} />,
          description: 'Your order is being prepared'
        };
      case 'ready': 
        return { 
          text: 'Ready for Pickup', 
          color: '#10b981', 
          bg: '#d1fae5',
          icon: <CheckCircle size={20} />,
          description: 'Order is ready! Please collect within 2 hours'
        };
      case 'picked': 
        return { 
          text: 'Picked Up', 
          color: '#059669', 
          bg: '#a7f3d0',
          icon: <CheckCircle size={20} />,
          description: 'Order collected successfully'
        };
      case 'not_picked': 
        return { 
          text: 'Not Picked', 
          color: '#dc2626', 
          bg: '#fee2e2',
          icon: <XCircle size={20} />,
          description: 'Order was not picked up within time'
        };
      case 'cancelled': 
        return { 
          text: 'Cancelled', 
          color: '#6b7280', 
          bg: '#f3f4f6',
          icon: <XCircle size={20} />,
          description: 'Order has been cancelled'
        };
      case 'rejected': 
        return { 
          text: 'Rejected', 
          color: '#dc2626', 
          bg: '#fee2e2',
          icon: <XCircle size={20} />,
          description: 'Order was rejected by cafeteria staff'
        };
      default: 
        return { 
          text: 'Unknown', 
          color: '#6b7280', 
          bg: '#f3f4f6',
          icon: <AlertCircle size={20} />,
          description: 'Unknown order status'
        };
    }
  };

  // ✅ UPDATED: Get payment status info based on paymentStatus field
  const getPaymentStatusInfo = (paymentStatus, paymentOption) => {
    switch(paymentStatus?.toLowerCase()) {
      case '100_paid':
        return { 
          text: '✅ 100% Fully Paid Online',
          color: '#065f46',
          bg: '#d1fae5',
          icon: <CheckCircle size={16} />,
          description: 'Full payment completed online'
        };
      case '50_paid':
        return { 
          text: '⏳ 50% Advance Paid',
          color: '#92400e',
          bg: '#fef3c7',
          icon: <Clock size={16} />,
          description: '50% advance paid online, remaining 50% cash at pickup'
        };
      case 'cash_50_received':
        return { 
          text: '✅ 100% Fully Paid (50% online + 50% cash)',
          color: '#065f46',
          bg: '#d1fae5',
          icon: <CheckCircle size={16} />,
          description: 'Full payment completed'
        };
      case 'fully_paid':
        return { 
          text: '✅ 100% Fully Paid',
          color: '#065f46',
          bg: '#d1fae5',
          icon: <CheckCircle size={16} />,
          description: 'Full payment completed'
        };
      case 'pending':
        return { 
          text: '❌ Payment Pending',
          color: '#dc2626',
          bg: '#fee2e2',
          icon: <XCircle size={16} />,
          description: 'Payment not completed'
        };
      case 'refunded':
        return { 
          text: '↩️ Refund Processed',
          color: '#7c3aed',
          bg: '#ede9fe',
          icon: <RefreshCw size={16} />,
          description: 'Payment refunded'
        };
      case 'failed':
        return { 
          text: '❌ Payment Failed',
          color: '#dc2626',
          bg: '#fee2e2',
          icon: <XCircle size={16} />,
          description: 'Payment failed'
        };
      default:
        // Fallback for old data or unknown status
        if (paymentOption === '100') {
          return { 
            text: '✅ 100% Fully Paid',
            color: '#065f46',
            bg: '#d1fae5',
            icon: <CheckCircle size={16} />,
            description: 'Full payment completed'
          };
        } else if (paymentOption === '50') {
          return { 
            text: '⏳ 50% Advance Paid',
            color: '#92400e',
            bg: '#fef3c7',
            icon: <Clock size={16} />,
            description: '50% advance paid online, remaining 50% cash at pickup'
          };
        } else {
          return { 
            text: '❌ Payment Pending',
            color: '#dc2626',
            bg: '#fee2e2',
            icon: <XCircle size={16} />,
            description: 'Payment not completed'
          };
        }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-PK', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString('en-PK') || '0'}`;
  };

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await axios.put(`/api/user/orders/${orderId}/cancel`, {
        reason: 'Cancelled by user'
      });
      
      if (response.data.success) {
        alert('Order cancelled successfully');
        fetchOrderDetails();
      } else {
        alert(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to cancel order';
      alert(`Error: ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '500px',
          padding: '20px'
        }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>
            Loading Order Details...
          </h3>
          <p style={{ color: '#6b7280', textAlign: 'center' }}>
            Please wait while we fetch your order information
          </p>
        </div>
      </UserLayout>
    );
  }

  if (error || !order) {
    return (
      <UserLayout>
        <div style={{ 
          maxWidth: '600px', 
          margin: '80px auto', 
          padding: '40px 20px',
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
            margin: '0 auto 20px'
          }}>
            <AlertCircle size={48} />
          </div>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            {error || 'Order Not Found'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            The order you're looking for doesn't exist or you don't have permission to view it.
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
              Back to Orders
            </button>
            <button
              onClick={fetchOrderDetails}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus, order.paymentOption);

  return (
    <UserLayout>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <button
              onClick={() => navigate('/user/orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '12px',
                padding: '0'
              }}
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#1f2937'
              }}>
                Order #{order.orderNumber || order._id?.slice(-8)}
              </h1>
              <span style={{
                padding: '8px 16px',
                backgroundColor: statusInfo.bg,
                color: statusInfo.color,
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {statusInfo.icon}
                {statusInfo.text}
              </span>
            </div>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>
              {statusInfo.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
              Order Date
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
              {formatDateTime(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '32px',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Left Column - Order Items & Details */}
          <div>
            {/* Order Items */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Package size={20} />
                Order Items
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items?.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '500', 
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {item.name || 'Unknown Item'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Quantity: {item.quantity || 1}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: '#059669',
                      minWidth: '100px',
                      textAlign: 'right'
                    }}>
                      {formatCurrency(item.price * (item.quantity || 1))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            {(order.status !== 'cancelled' && order.status !== 'rejected') && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '20px',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Clock size={20} />
                  Order Timeline
                </h3>
                
                <div style={{ position: 'relative', paddingLeft: '30px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '10px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: '#e5e7eb'
                  }}></div>
                  
                  {[
                    { 
                      event: 'Order Placed', 
                      time: order.createdAt,
                      active: true,
                      icon: '📝'
                    },
                    { 
                      event: 'Payment Confirmed', 
                      time: order.paymentStatus === '100_paid' || order.paymentStatus === '50_paid' ? order.createdAt : null,
                      active: order.paymentStatus === '100_paid' || order.paymentStatus === '50_paid',
                      icon: '💰'
                    },
                    { 
                      event: 'Staff Accepted', 
                      time: order.acceptedAt,
                      active: order.status === 'accepted' || order.status === 'preparing' || order.status === 'ready' || order.status === 'picked',
                      icon: '👍'
                    },
                    { 
                      event: 'Preparing', 
                      time: order.preparingAt,
                      active: order.status === 'preparing' || order.status === 'ready' || order.status === 'picked',
                      icon: '👨‍🍳'
                    },
                    { 
                      event: 'Ready for Pickup', 
                      time: order.readyAt,
                      active: order.status === 'ready' || order.status === 'picked',
                      icon: '✅'
                    },
                    { 
                      event: 'Picked Up', 
                      time: order.pickedAt,
                      active: order.status === 'picked',
                      icon: '📦'
                    }
                  ].map((item, index) => (
                    <div key={index} style={{ 
                      position: 'relative',
                      marginBottom: '24px',
                      opacity: item.active ? 1 : 0.5
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-28px',
                        top: '0',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: item.active ? '#10b981' : '#d1d5db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px'
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: item.active ? '600' : '500',
                          color: item.active ? '#1f2937' : '#9ca3af'
                        }}>
                          {item.event}
                        </span>
                      </div>
                      {item.time && (
                        <div style={{ 
                          fontSize: '14px', 
                          color: item.active ? '#6b7280' : '#9ca3af'
                        }}>
                          {formatDateTime(item.time)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Actions */}
          <div>
            {/* Order Summary */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              position: 'sticky',
              top: '24px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <DollarSign size={20} />
                Order Summary
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span style={{ fontWeight: '500' }}>{formatCurrency(order.totalAmount)}</span>
                </div> */}
                
                {/* ✅ UPDATED: Show advance payment and remaining based on payment status */}
                {(order.paymentStatus === '50_paid' || order.paymentOption === '50') && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Advance Paid (50%):</span>
                      <span style={{ fontWeight: '500', color: '#059669' }}>
                        {formatCurrency(order.advancePayment || Math.round(order.totalAmount * 0.5))}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Remaining (Cash):</span>
                      <span style={{ fontWeight: '500', color: '#d97706' }}>
                        {formatCurrency(order.remainingPayment || Math.round(order.totalAmount * 0.5))}
                      </span>
                    </div>
                  </>
                )}
                
                {(order.paymentStatus === '100_paid' || order.paymentStatus === 'fully_paid') && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Full Payment:</span>
                    <span style={{ fontWeight: '500', color: '#059669' }}>
                      {formatCurrency(order.advancePayment || order.totalAmount)}
                    </span>
                  </div>
                )}
                
                {order.fineAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#dc2626' }}>Late Pickup Fine:</span>
                    <span style={{ fontWeight: '500', color: '#dc2626' }}>
                      +{formatCurrency(order.fineAmount)}
                    </span>
                  </div>
                )}
                
                <div style={{ 
                  height: '1px', 
                  backgroundColor: '#e5e7eb', 
                  margin: '8px 0' 
                }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>Total:</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                    {formatCurrency(order.totalAmount + (order.fineAmount || 0))}
                  </span>
                </div>
              </div>

              {/* ✅ UPDATED: Payment Status Display */}
              <div style={{ 
                padding: '12px 16px',
                backgroundColor: paymentStatusInfo.bg,
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: `4px solid ${paymentStatusInfo.color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {paymentStatusInfo.icon}
                  <span style={{ 
                    fontWeight: 'bold',
                    color: paymentStatusInfo.color
                  }}>
                    {paymentStatusInfo.text}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: paymentStatusInfo.color, margin: '4px 0 0 0', opacity: 0.8 }}>
                  {paymentStatusInfo.description}
                </p>
                {/* Show remaining payment message for 50% payments */}
                {order.paymentStatus === '50_paid' && order.remainingPayment > 0 && (
                  <div style={{ 
                    marginTop: '8px',
                    padding: '6px 10px',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#92400e'
                  }}>
                    💵 Remaining {formatCurrency(order.remainingPayment)} to be paid at pickup counter
                  </div>
                )}
              </div>

              {/* Cafeteria Info */}
              <div style={{ 
                padding: '12px 16px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={16} />
                  <span style={{ fontWeight: 'bold', color: '#1e40af' }}>Pickup Location</span>
                </div>
                <p style={{ color: '#4b5563', margin: '0', fontSize: '14px' }}>
                  <strong>{order.cafeteria || 'Cafeteria'}</strong>
                  <br />
                  Please collect your order from the counter
                </p>
              </div>

              {/* Order Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Cancel Order Button (only for certain statuses) */}
                {(['pending_payment', 'pending_staff', 'accepted'].includes(order.status)) && (
                  <button
                    onClick={cancelOrder}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <XCircle size={18} />
                    Cancel Order
                  </button>
                )}
                
                {/* Collect Order Button */}
                {order.status === 'ready' && (
                  <button
                    onClick={() => {
                      const orderId = order.orderNumber || order._id?.slice(-8);
                      let message = `Order #${orderId}\n\n`;
                      message += `Please show this at the pickup counter.\n\n`;
                      
                      if (order.paymentStatus === '50_paid') {
                        message += `Payment: 50% advance paid online\n`;
                        message += `Remaining to pay: ${formatCurrency(order.remainingPayment)}\n`;
                      } else if (order.paymentStatus === '100_paid') {
                        message += `Payment: 100% paid online (No payment required)\n`;
                      }
                      
                      message += `\nTotal: ${formatCurrency(order.totalAmount + (order.fineAmount || 0))}`;
                      alert(message);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <Truck size={18} />
                    Collect Order
                  </button>
                )}
                
                {/* Contact Support Button */}
                <button
                  onClick={() => alert('For support, please:\n\n1. Visit the cafeteria counter\n2. Call: 123-456-7890\n3. Email: support@cafeteria.com')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Need Help? Contact Support
                </button>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  color: '#1f2937'
                }}>
                  Your Notes
                </h3>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  color: '#4b5563',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {order.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          
          button:active {
            transform: translateY(0);
          }
        `}
      </style>
    </UserLayout>
  );
}

export default OrderDetails;