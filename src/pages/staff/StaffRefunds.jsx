// src/pages/staff/StaffRefunds.jsx - SIMPLE & WORKING VERSION
import React, { useState, useEffect } from 'react';
import { getPendingCashRefunds, markCashRefundComplete } from '../../utils/api';
import StaffLayout from "../../layouts/StaffLayout";

const StaffRefunds = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await getPendingCashRefunds();
      console.log('Refunds API response:', response.data);
      
      if (response.data?.success) {
        setOrders(response.data.data || []);
      } else {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setMessage('❌ Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleCashRefund = async (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    // Calculate refund amount
    let refundAmount = 0;
    if (order.paymentOption === '50') {
      refundAmount = order.totalAmount * 0.5;
    } else {
      refundAmount = order.totalAmount;
    }

    if (!window.confirm(`Issue PKR ${refundAmount} cash refund for order #${order.orderNumber}?`)) {
      return;
    }

    try {
      const response = await markCashRefundComplete(orderId);
      
      if (response.data?.success) {
        // Remove from list
        setOrders(prev => prev.filter(o => o._id !== orderId));
        setMessage(`✅ Refund of PKR ${refundAmount} completed!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to process refund');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error processing refund');
    }
  };

  // Simple inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '16px'
    },
    statsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      flex: '1',
      minWidth: '250px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    orderCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    refundSection: {
      backgroundColor: '#fffbeb',
      border: '2px solid #fbbf24',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px'
    },
    button: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      width: '100%',
      marginTop: '15px'
    },
    message: {
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontWeight: 'bold'
    },
    successMessage: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p>Loading refunds...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div style={styles.container}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Message Alert */}
          {message && (
            <div style={{
              ...styles.message,
              ...(message.includes('✅') ? styles.successMessage : styles.errorMessage)
            }}>
              {message}
            </div>
          )}

          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Cash Refunds Management</h1>
            <p style={styles.subtitle}>Process cash refunds for cancelled/rejected orders</p>
            <div style={{
              backgroundColor: '#e0f2fe',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '15px',
              display: 'inline-block'
            }}>
              <span style={{ color: '#0369a1', fontWeight: 'bold' }}>
                Staff: Basement Cafe
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsContainer}>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>⏳</span>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Pending Refunds</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706', margin: '5px 0 0 0' }}>
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>✅</span>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Cancelled Orders</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', margin: '5px 0 0 0' }}>
                    {orders.filter(o => o.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>💰</span>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Total to Refund</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1d4ed8', margin: '5px 0 0 0' }}>
                    PKR {orders.reduce((sum, order) => {
                      if (order.paymentOption === '50') return sum + (order.totalAmount * 0.5);
                      return sum + order.totalAmount;
                    }, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#374151' }}>
            Pending Cash Refunds ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
              border: '2px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#374151' }}>
                All Caught Up!
              </h3>
              <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
                No pending cash refunds. All cancelled/rejected orders have been processed.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const refundAmount = order.paymentOption === '50' 
                ? order.totalAmount * 0.5 
                : order.totalAmount;
              
              const isCancelled = order.status === 'cancelled';

              return (
                <div key={order._id} style={styles.orderCard}>
                  {/* Order Header */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <span style={{
                      backgroundColor: isCancelled ? '#fee2e2' : '#ffedd5',
                      color: isCancelled ? '#991b1b' : '#9a3412',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      {isCancelled ? 'CANCELLED' : 'REJECTED'}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                      Order #{order.orderNumber}
                    </h3>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Two Column Layout */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '30px',
                    marginBottom: '20px'
                  }}>
                    {/* Left Column - Order Details */}
                    <div>
                      {/* Customer Info */}
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#374151' }}>
                          👤 Customer Details
                        </h4>
                        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                            {order.user?.name || 'Unknown Customer'}
                          </p>
                          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                            {order.user?.email || 'No email provided'}
                          </p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#374151' }}>
                          💳 Payment Details
                        </h4>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '15px',
                          backgroundColor: '#f3f4f6', 
                          padding: '15px', 
                          borderRadius: '8px'
                        }}>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>Total Bill</p>
                            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>
                              PKR {order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>Payment Type</p>
                            <p style={{
                              fontWeight: 'bold',
                              fontSize: '18px',
                              margin: 0,
                              color: order.paymentOption === '50' ? '#d97706' : '#059669'
                            }}>
                              {order.paymentOption === '50' ? '50% Advance' : '100% Paid'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Items */}
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#374151' }}>
                        🍽️ Items Ordered
                      </h4>
                      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                        {order.items?.map((item, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: index < order.items.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <div>
                              <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{item.name}</p>
                              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                                PKR {(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                @PKR {item.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Refund Action Section */}
                  <div style={styles.refundSection}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>💸</div>
                      <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#92400e', marginBottom: '5px' }}>
                        CASH REFUND REQUIRED
                      </h4>
                      <p style={{ color: '#92400e', fontSize: '14px' }}>
                        Hand over exact cash amount to customer
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '20px',
                      border: '1px solid #fbbf24'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                          Refund Amount
                        </p>
                        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#92400e', margin: '5px 0' }}>
                          PKR {refundAmount.toFixed(2)}
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          {order.paymentOption === '50' 
                            ? '50% of total bill (advance payment)'
                            : '100% of total bill (full payment)'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCashRefund(order._id)}
                      style={styles.button}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      ✅ CONFIRM CASH REFUND ISSUED
                    </button>

                    <p style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      textAlign: 'center',
                      marginTop: '15px',
                      fontStyle: 'italic'
                    }}>
                      ⚠️ Click only after physically handing cash to customer
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* Footer Instructions */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '30px'
          }}>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e40af', marginBottom: '15px' }}>
              📋 Refund Process Instructions
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h5 style={{ color: '#1e40af', fontWeight: 'bold', marginBottom: '10px' }}>✅ Do's:</h5>
                <ul style={{ color: '#1e40af', margin: 0, paddingLeft: '20px' }}>
                  <li>Verify customer identity with ID card</li>
                  <li>Count cash carefully twice</li>
                  <li>Get customer signature on receipt</li>
                  <li>Click button only after cash handover</li>
                </ul>
              </div>
              <div>
                <h5 style={{ color: '#991b1b', fontWeight: 'bold', marginBottom: '10px' }}>❌ Don'ts:</h5>
                <ul style={{ color: '#991b1b', margin: 0, paddingLeft: '20px' }}>
                  <li>Don't issue refund without ID verification</li>
                  <li>Don't click button before giving cash</li>
                  <li>Don't process for wrong customer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffRefunds;