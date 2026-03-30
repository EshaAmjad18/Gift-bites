

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { CreditCard, Shield, AlertCircle, CheckCircle, Lock, Clock, X, ShoppingBag, Info } from 'lucide-react';
import { createOrder, createPaymentSession } from '../../utils/userApi';
import { fetchCart } from '../../utils/userApi';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentOption, setPaymentOption] = useState('50'); // '50' or '100' or 'cash'
  const [cartData, setCartData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Constants
  const MINIMUM_ONLINE_AMOUNT = 150; // Rs. 150 minimum for online payments

  // Get cart data from location state or fetch from API
  useEffect(() => {
    const loadCartData = async () => {
      try {
        // Try to get cart from location state first
        if (location.state?.cart) {
          setCartData(location.state.cart);
          return;
        }
        
        // If no cart in state, fetch from API
        const response = await fetchCart();
        if (response.success && response.cart && response.cart.items.length > 0) {
          setCartData(response.cart);
        } else {
          navigate('/user/cart');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        navigate('/user/cart');
      }
    };

    loadCartData();
  }, [location.state, navigate]);

  // Auto-select cash if amount is too small for online payment
  useEffect(() => {
    if (cartData && paymentOption !== 'cash') {
      const amountToCheck = paymentOption === '50' 
        ? Math.round(calculateTotals().total * 0.5)
        : calculateTotals().total;
        
      if (amountToCheck < MINIMUM_ONLINE_AMOUNT) {
        setWarning(`Online payment requires minimum Rs. ${MINIMUM_ONLINE_AMOUNT}. Auto-switching to Cash at Pickup.`);
        setPaymentOption('cash');
      } else {
        setWarning(null);
      }
    }
  }, [cartData, paymentOption]);

  // Calculate totals WITHOUT service fee and tax
  const calculateTotals = () => {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return { subTotal: 0, total: 0 };
    }

    const subTotal = cartData.total || cartData.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    // No service fee or tax for students/staff
    const total = subTotal;

    return { subTotal, total };
  };

  const { subTotal, total } = calculateTotals();
  const advanceAmount = paymentOption === '50' ? Math.round(total * 0.5) : total;
  const remainingAmount = paymentOption === '50' ? total - advanceAmount : 0;

  // Handle online payment (Stripe)
  const handleOnlinePayment = async () => {
    if (!cartData) {
      setError('No items in cart');
      return;
    }

    // Double-check minimum amount
    const amountToCheck = paymentOption === '50' 
      ? Math.round(total * 0.5)
      : total;
      
    if (amountToCheck < MINIMUM_ONLINE_AMOUNT) {
      setError(`Online payment requires minimum Rs. ${MINIMUM_ONLINE_AMOUNT}. Please select "Cash at Pickup".`);
      setPaymentOption('cash');
      return;
    }

    setCreatingOrder(true);
    setError(null);
    setWarning(null);

    try {
      // Step 1: Create order in database
      console.log('Step 1: Creating order with payment option:', paymentOption);
      const orderResponse = await createOrder({
        paymentOption,
        notes: notes || 'Online payment via Stripe'
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const orderId = orderResponse.order._id;
      console.log('✅ Order created:', orderId);
      setOrderData(orderResponse.order);

      // Step 2: Create Stripe checkout session
      console.log('Step 2: Creating Stripe session for order:', orderId);
      const paymentResponse = await createPaymentSession(orderId);

      console.log('Payment response:', paymentResponse);
      
      if (paymentResponse.success && paymentResponse.url) {
        // Show warning if minimum was applied
        if (paymentResponse.warning) {
          setWarning(paymentResponse.warning.message);
        }
        
        console.log('✅ Stripe session created, redirecting to:', paymentResponse.url);
        // Redirect to Stripe checkout
        window.location.href = paymentResponse.url;
      } else {
        throw new Error(paymentResponse.message || 'Failed to create payment session');
      }
    } catch (err) {
      console.error('❌ Online payment error:', err);
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setCreatingOrder(false);
    }
  };

  // Success screen
  if (success && orderData) {
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
            backgroundColor: '#10b981',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 30px'
          }}>
            ✓
          </div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            ✅ Order Created Successfully!
          </h1>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            marginBottom: '30px'
          }}>
            You will be redirected to Stripe to complete your payment.
          </p>
          
          <div style={{
            padding: '25px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            marginBottom: '30px',
            border: '2px solid #10b981'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <ShoppingBag size={24} color="#059669" />
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                Order #{orderData.orderNumber || 'Loading...'}
              </span>
            </div>
            
            <div style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#059669',
              marginBottom: '15px'
            }}>
              Total: Rs. {orderData.totalAmount || total}
            </div>
            
            <div style={{ 
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              backgroundColor: paymentOption === '50' ? '#fef3c7' : '#d1fae5',
              borderLeft: `4px solid ${paymentOption === '50' ? '#f59e0b' : '#10b981'}`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '5px'
              }}>
                {paymentOption === '50' ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#f59e0b',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      50%
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#92400e' }}>
                      50% ADVANCE PAYMENT
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      100%
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#065f46' }}>
                      100% FULL PAYMENT
                    </span>
                  </>
                )}
              </div>
              
              {paymentOption === '50' && (
                <div style={{ color: '#92400e', fontSize: '14px' }}>
                  To Pay: <strong>Rs. {advanceAmount}</strong> (50% advance)
                  <br />
                  Remaining: <strong>Rs. {remainingAmount}</strong> to be paid at pickup
                </div>
              )}
              
              {paymentOption === '100' && (
                <div style={{ color: '#065f46', fontSize: '14px' }}>
                  To Pay: <strong>Rs. {orderData.totalAmount || total}</strong> (100% online)
                </div>
              )}
            </div>
            
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              ⏳ Redirecting to Stripe...
            </div>
          </div>
          
          <div style={{ color: '#6b7280', marginBottom: '20px' }}>
            <p>You will be redirected to Stripe payment page...</p>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              marginTop: '10px'
            }}>
              <div style={{
                width: '60%',
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                animation: 'loading 3s linear forwards'
              }}></div>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes loading {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}
        </style>
      </UserLayout>
    );
  }

  // Loading state
  if (!cartData) {
    return (
      <UserLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </UserLayout>
    );
  }

  // Main payment screen
  return (
    <UserLayout>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '24px' 
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Complete Your Order
          </h1>
          <p style={{ color: '#6b7280' }}>
            Secure checkout with multiple payment options
          </p>
        </div>

        {/* Order Summary */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px',
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
            <ShoppingBag size={20} />
            Order Summary
            <span style={{
              fontSize: '14px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '4px 12px',
              borderRadius: '20px',
              marginLeft: '10px'
            }}>
              {cartData.cafeteria || 'Cafeteria'}
            </span>
          </h3>
          
          {/* Items List */}
          <div style={{ marginBottom: '20px' }}>
            {cartData.items.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>
                    {item.quantity}x {item.itemName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Rs. {item.price} each
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#059669' }}>
                  Rs. {item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div style={{ 
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>Total:</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                Rs. {total}
              </span>
            </div>
          </div>

          {/* Order Notes */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Order Notes (Optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for your order..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Payment Options */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CreditCard size={24} />
            Select Payment Method
          </h3>
          
          {/* Minimum Amount Notice */}
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '24px',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Info size={16} />
            <span><strong>Note:</strong> Minimum online payment is <strong>Rs. {MINIMUM_ONLINE_AMOUNT}</strong>. Smaller amounts automatically use Cash at Pickup.</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {/* 50% Advance Payment */}
            <div
              onClick={() => {
                const amountToCheck = Math.round(total * 0.5);
                if (amountToCheck >= MINIMUM_ONLINE_AMOUNT) {
                  setPaymentOption('50');
                  setError(null);
                  setWarning(null);
                } else {
                  setWarning(`50% advance (Rs. ${amountToCheck}) is below minimum Rs. ${MINIMUM_ONLINE_AMOUNT}. Auto-switching to Cash at Pickup.`);
                  setPaymentOption('cash');
                }
              }}
              style={{
                padding: '20px',
                backgroundColor: paymentOption === '50' ? '#f0fdf4' : '#f9fafb',
                border: `2px solid ${paymentOption === '50' ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                opacity: Math.round(total * 0.5) < MINIMUM_ONLINE_AMOUNT ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: paymentOption === '50' ? '#10b981' : '#9ca3af',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  50%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                    50% Advance Payment
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Pay 50% now online, remaining 50% in cash at pickup
                  </div>
                  {Math.round(total * 0.5) < MINIMUM_ONLINE_AMOUNT && (
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      (Not available - below minimum Rs. {MINIMUM_ONLINE_AMOUNT})
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                    Rs. {Math.round(total * 0.5)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Pay now online
                  </div>
                </div>
              </div>
            </div>

            {/* 100% Online Payment */}
            <div
              onClick={() => {
                if (total >= MINIMUM_ONLINE_AMOUNT) {
                  setPaymentOption('100');
                  setError(null);
                  setWarning(null);
                } else {
                  setWarning(`Total amount (Rs. ${total}) is below minimum Rs. ${MINIMUM_ONLINE_AMOUNT}. Auto-switching to Cash at Pickup.`);
                  setPaymentOption('cash');
                }
              }}
              style={{
                padding: '20px',
                backgroundColor: paymentOption === '100' ? '#f0fdf4' : '#f9fafb',
                border: `2px solid ${paymentOption === '100' ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                opacity: total < MINIMUM_ONLINE_AMOUNT ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: paymentOption === '100' ? '#10b981' : '#9ca3af',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  100%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                    100% Online Payment
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Pay full amount online. No payment needed at pickup
                  </div>
                  {total < MINIMUM_ONLINE_AMOUNT && (
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      (Not available - below minimum Rs. {MINIMUM_ONLINE_AMOUNT})
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                    Rs. {total}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Pay now online
                  </div>
                </div>
              </div>
            </div>           
          </div>

          {/* Warning Message */}
          {warning && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '8px',
              marginBottom: '24px',
              borderLeft: '4px solid #d97706',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Info size={20} />
              <div>{warning}</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '24px',
              borderLeft: '4px solid #dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

 
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/user/cart')}
              style={{
                padding: '14px 28px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '150px'
              }}
            >
              <X size={18} />
              Back to Cart
            </button>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleOnlinePayment}
                disabled={creatingOrder || 
                  (paymentOption === '50' && Math.round(total * 0.5) < MINIMUM_ONLINE_AMOUNT) ||
                  (paymentOption === '100' && total < MINIMUM_ONLINE_AMOUNT)}
                style={{
                  padding: '16px 32px',
                  backgroundColor: creatingOrder ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: (creatingOrder || 
                    (paymentOption === '50' && Math.round(total * 0.5) < MINIMUM_ONLINE_AMOUNT) ||
                    (paymentOption === '100' && total < MINIMUM_ONLINE_AMOUNT)) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: '200px',
                  opacity: ((paymentOption === '50' && Math.round(total * 0.5) < MINIMUM_ONLINE_AMOUNT) ||
                    (paymentOption === '100' && total < MINIMUM_ONLINE_AMOUNT)) ? 0.6 : 1
                }}
              >
                {creatingOrder ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    {paymentOption === '50' ? `Pay Rs. ${Math.round(total * 0.5)} Now` : `Pay Rs. ${total} Now`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '12px',
          color: '#6b7280',
          lineHeight: '1.6'
        }}>
          All transactions are secure and encrypted. For any issues, contact cafeteria staff.
        </p>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes loading {
            from { width: 0%; }
            to { width: 100%; }
          }
          
          textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          button:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
        `}
      </style>
    </UserLayout>
  );
}

export default Payment;