
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';
import { 
  getStaffOrders, 
  updateOrderStatus, 
  sendWarning 
} from '../../utils/api';

const StaffOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // ==================== FETCH ORDERS ====================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 FETCHING ORDERS FOR STAFF...');
      
      const response = await getStaffOrders();
      
      if (response.data && response.data.success) {
        console.log('✅ SUCCESS: Orders fetched -', response.data.orders?.length || 0, 'orders');
        
        // 🔍 CRITICAL DEBUG: Check warning counts
        if (response.data.orders && response.data.orders.length > 0) {
          console.log('🔍 DEBUG WARNING COUNTS:');
          response.data.orders.forEach((order) => {
            if (order.status === 'not_picked') {
              console.log(`  ${order.orderNumber}: warningCount = ${order.warningCount || 0}, strikes = ${order.strikes || 0}`);
            }
          });
        }
        
        setOrders(response.data.orders || []);
        setLastUpdateTime(new Date());
      } else {
        console.error('❌ FAILED: Response not successful');
        setOrders([]);
      }
    } catch (error) {
      console.error('🔥 ERROR FETCHING ORDERS:', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // ==================== UPDATE ORDER STATUS ====================
  const handleUpdateStatus = async (orderId, newStatus) => {
    const statusMap = {
      'Accepted': 'accepted',
      'Rejected': 'rejected', 
      'Preparing': 'preparing',
      'Ready': 'ready',
      'Picked': 'picked',
      'Not Picked': 'not_picked'
    };
    
    const backendStatus = statusMap[newStatus] || newStatus.toLowerCase();
    
    if (!backendStatus) {
      alert(`Invalid status: ${newStatus}`);
      return;
    }
    
    const confirmMessages = {
      'accepted': 'Accept this order?',
      'rejected': 'Reject this order? This will initiate refund.',
      'preparing': 'Mark as preparing?',
      'ready': 'Mark as ready? (2-hour pickup timer starts)',
      'picked': 'Mark as picked?',
      'not_picked': 'Mark as not picked? (10% fine will be applied)'
    };
    
    const confirmMsg = confirmMessages[backendStatus] || `Change status to ${backendStatus}?`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    try {
      const response = await updateOrderStatus(orderId, backendStatus);
      
      if (response.data.success) {
        alert(`✅ Order status updated to ${backendStatus}`);
        
        // IMMEDIATE refresh
        setTimeout(fetchOrders, 300);
      } else {
        alert(`❌ Failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('🔥 ERROR in handleUpdateStatus:', error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // ==================== SEND WARNING ====================
  const handleSendWarning = async (orderId) => {
    try {
      console.log('⚠️ Sending warning for order:', orderId);
      
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        alert('Order not found');
        return;
      }
      
      const currentWarnings = order.warningCount || 0;
      const userStrikes = order.user?.strikes || 0;
      
      if (currentWarnings >= 3) {
        alert('❌ User already has 3 warnings. Maximum warnings reached.');
        return;
      }
      
      const confirmationMsg = 
        `Send warning to ${order.user?.name || 'the user'}?\n\n` +
        `📊 Current Status:\n` +
        `• Warnings: ${currentWarnings}/3\n` +
        `• Strikes: ${userStrikes}\n\n` +
        `⚠️ User will receive a warning notification.`;
      
      if (!window.confirm(confirmationMsg)) {
        return;
      }
      
      console.log('📡 Calling sendWarning API...');
      const response = await sendWarning(orderId);
      console.log('✅ Warning API response:', response.data);
      
      if (response.data.success) {
        // Get UPDATED data from backend response
        const updatedOrder = response.data.order;
        const warningCount = updatedOrder.warningCount || (currentWarnings + 1);
        const strikes = updatedOrder.strikes || 0;
        const userStrikes = updatedOrder.user?.strikes || 0;
        
        console.log('📊 Updated from backend:', {
          warningCount: warningCount,
          strikes: strikes,
          userStrikes: userStrikes
        });
        
        // Show success message
        alert(`✅ Warning sent successfully!\n\n` +
              `📊 Updated Status:\n` +
              `• Warnings: ${warningCount}/3\n` +
              `• Total Strikes: ${userStrikes}\n\n` +
              (warningCount >= 3 ? 
                `🚨 User has reached maximum warnings!\n` : 
                `ℹ️ ${3 - warningCount} warning(s) remaining.\n`) +
              `📧 User has been notified.`);
        
        // 🚨 CRITICAL: Update the order in state IMMEDIATELY with backend data
        setOrders(prevOrders => 
          prevOrders.map(o => {
            if (o._id === orderId) {
              return {
                ...o,
                warningCount: warningCount,
                strikes: strikes,
                user: updatedOrder.user ? {
                  ...o.user,
                  ...updatedOrder.user
                } : o.user,
                lastWarningAt: new Date() // Add timestamp
              };
            }
            return o;
          })
        );
        
        // Force UI update
        setTimeout(() => {
          // This forces React to re-render the status actions
          setOrders(prev => [...prev]);
        }, 100);
        
        // Refresh from server after short delay
        setTimeout(() => {
          console.log('🔄 Final refresh from server...');
          fetchOrders();
        }, 800);
        
      } else {
        alert(`❌ Failed to send warning: ${response.data.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ Send warning error:', error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // ==================== FILTER ORDERS ====================
  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Filter by tab
    switch(activeTab) {
      case 'new':
        filtered = filtered.filter(order => order.status === 'pending_staff');
        break;
      case 'active':
        filtered = filtered.filter(order => ['accepted', 'preparing'].includes(order.status));
        break;
      case 'ready':
        filtered = filtered.filter(order => order.status === 'ready');
        break;
      case 'completed':
        filtered = filtered.filter(order => order.status === 'picked');
        break;
      case 'rejected':
        filtered = filtered.filter(order => order.status === 'rejected');
        break;
      case 'notPicked':
        filtered = filtered.filter(order => order.status === 'not_picked');
        break;
      default:
        break;
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(term) ||
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  // ==================== GET STATUS ACTIONS ====================
  const getStatusActions = (order) => {
    console.log(`🔘 STATUS ACTIONS for ${order.orderNumber}:`, {
      status: order.status,
      warningCount: order.warningCount || 0,
      strikes: order.strikes || 0
    });
    
    const actions = [];
    
    if (order.status === 'pending_staff') {
      actions.push(
        { 
          label: '✅ Accept Order', 
          action: () => handleUpdateStatus(order._id, 'accepted'), 
          color: '#10b981'
        },
        { 
          label: '❌ Reject Order', 
          action: () => handleUpdateStatus(order._id, 'rejected'), 
          color: '#ef4444'
        }
      );
    }
    else if (order.status === 'accepted') {
      actions.push(
        { 
          label: '👨‍🍳 Mark as Preparing', 
          action: () => handleUpdateStatus(order._id, 'preparing'), 
          color: '#8b5cf6'
        }
      );
    }
    else if (order.status === 'preparing') {
      actions.push(
        { 
          label: '✅ Mark as Ready', 
          action: () => handleUpdateStatus(order._id, 'ready'), 
          color: '#10b981'
        }
      );
    }
    else if (order.status === 'ready') {
      actions.push(
        { 
          label: '📦 Mark as Picked', 
          action: () => handleUpdateStatus(order._id, 'picked'), 
          color: '#10b981'
        },
        { 
          label: '⚠️ Mark as Not Picked', 
          action: () => handleUpdateStatus(order._id, 'not_picked'), 
          color: '#f59e0b'
        }
      );
    }
    else if (order.status === 'not_picked') {
      const currentWarnings = order.warningCount || 0;
      
      if (currentWarnings < 3) {
        // 🚨 FIXED: Button shows NEXT warning number
        const warningButtonText = 
          currentWarnings === 0 ? `⚠️ Send Warning` :
          currentWarnings === 1 ? `⚠️ Send Warning` :
          `⚠️ Send Final Warning (3/3)`;
        
        const warningButtonColor = 
          currentWarnings === 0 ? '#f59e0b' :
          currentWarnings === 1 ? '#f97316' :
          '#dc2626';
        
        actions.push({
          label: warningButtonText,
          action: () => handleSendWarning(order._id),
          color: warningButtonColor
        });
      } else {
        const isBlocked = order.user?.isBlocked || false;
        actions.push({
          label: isBlocked ? '🚫 Account Blocked (3/3)' : '✅ 3/3 Warnings Sent',
          action: () => alert(
            isBlocked ? 
            'User account is blocked due to 3 strikes.' :
            'User has received maximum warnings (3/3).'
          ),
          color: '#6b7280'
        });
      }
    }
    
    return actions;
  };

  // =============== GET PAYMENT INFO =============== 
  const getPaymentInfo = (order) => {
    if (order.paymentStatus === '100_paid' || order.paymentStatus === 'fully_paid') {
      return {
        text: '✅ 100% PAID',
        color: '#10b981',
        bg: '#d1fae5',
        details: `Full amount paid: Rs. ${order.totalAmount}`
      };
    } 
    else if (order.paymentStatus === 'cash_50_received') {
      return {
        text: '✅ 100% PAID (50% online + 50% cash)',
        color: '#10b981',
        bg: '#d1fae5',
        details: `Paid: Rs. ${order.totalAmount} (50% online + 50% cash received)`
      };
    }
    else if (order.paymentStatus === '50_paid') {
      const paid = order.advancePayment || Math.round(order.totalAmount * 0.5);
      const remaining = order.totalAmount - paid;
      return {
        text: '🟡 50% ADVANCE PAID',
        color: '#f59e0b',
        bg: '#fef3c7',
        details: `Paid: Rs. ${paid}, Remaining: Rs. ${remaining} (Cash at pickup)`
      };
    }
    else if (order.paymentStatus === 'pending') {
      return {
        text: '⏳ PAYMENT PENDING',
        color: '#6b7280',
        bg: '#f3f4f6',
        details: 'Waiting for payment completion'
      };
    }
    else {
      return {
        text: '❌ PAYMENT UNKNOWN',
        color: '#ef4444',
        bg: '#fee2e2',
        details: `Status: ${order.paymentStatus || 'N/A'}`
      };
    }
  };

  // ==================== GET STATUS COLOR ====================
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending_staff': return { bg: '#fef3c7', color: '#92400e', text: 'New Order' };
      case 'accepted': return { bg: '#dbeafe', color: '#1e40af', text: 'Accepted' };
      case 'preparing': return { bg: '#ede9fe', color: '#7c3aed', text: 'Preparing' };
      case 'ready': return { bg: '#d1fae5', color: '#065f46', text: 'Ready' };
      case 'picked': return { bg: '#dcfce7', color: '#166534', text: 'Completed' };
      case 'rejected': return { bg: '#fee2e2', color: '#dc2626', text: 'Rejected' };
      case 'not_picked': return { bg: '#fee2e2', color: '#dc2626', text: 'Not Picked' };
      default: return { bg: '#f3f4f6', color: '#6b7280', text: status };
    }
  };

  // ==================== FORMAT TIME ====================
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // ==================== LOADING STATE ====================
  if (loading && orders.length === 0) {
    return (
      <StaffLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading orders...</p>
        </div>
      </StaffLayout>
    );
  }

  const filteredOrders = getFilteredOrders();
  const tabs = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'new', label: 'New', count: orders.filter(o => o.status === 'pending_staff').length },
    { key: 'active', label: 'Active', count: orders.filter(o => ['accepted', 'preparing'].includes(o.status)).length },
    { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
    { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'picked').length },
    { key: 'rejected', label: 'Rejected', count: orders.filter(o => o.status === 'rejected').length },
    { key: 'notPicked', label: 'Not Picked', count: orders.filter(o => o.status === 'not_picked').length }
  ];

  return (
    <StaffLayout>
      <div style={styles.container}>
        {/* ========== HEADER ========== */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📦 Order Management</h1>
            <p style={styles.subtitle}>
              Manage and update order status
              {lastUpdateTime && (
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '10px' }}>
                  Last updated: {lastUpdateTime.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button 
              onClick={() => {
                console.log('🔍 Current orders debug:', orders);
                fetchOrders();
              }}
              style={styles.refreshButton}
            >
              🔄 Refresh
            </button>
            <button 
              onClick={() => navigate('/staff/dashboard')}
              style={styles.dashboardButton}
            >
              📊 Dashboard
            </button>
          </div>
        </div>

        {/* ========== STATS ========== */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Orders</div>
            <div style={styles.statValue}>{orders.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>New Orders</div>
            <div style={{...styles.statValue, color: '#f59e0b'}}>
              {orders.filter(o => o.status === 'pending_staff').length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active</div>
            <div style={{...styles.statValue, color: '#3b82f6'}}>
              {orders.filter(o => ['accepted', 'preparing'].includes(o.status)).length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Ready</div>
            <div style={{...styles.statValue, color: '#10b981'}}>
              {orders.filter(o => o.status === 'ready').length}
            </div>
          </div>
        </div>

        {/* ========== SEARCH ========== */}
        <div style={styles.searchContainer}>
          <div style={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="🔍 Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={styles.clearButton}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ========== TABS ========== */}
        <div style={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.tabButton,
                backgroundColor: activeTab === tab.key ? '#3b82f6' : '#f3f4f6',
                color: activeTab === tab.key ? 'white' : '#4b5563'
              }}
            >
              {tab.label}
              <span style={styles.tabCount}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ========== ORDERS LIST ========== */}
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No orders found</h3>
            <p style={styles.emptyText}>
              {searchTerm 
                ? `No orders matching "${searchTerm}"` 
                : activeTab === 'all' 
                  ? 'No orders yet' 
                  : `No ${activeTab} orders at the moment`}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={styles.emptyButton}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            {filteredOrders.map(order => {
              const paymentInfo = getPaymentInfo(order);
              const statusActions = getStatusActions(order);
              const statusColor = getStatusColor(order.status);
              
              return (
                <div key={order._id} style={styles.orderCard}>
                  {/* Order Header */}
                  <div style={styles.orderHeader}>
                    <div>
                      <h3 style={styles.orderTitle}>
                        Order #{order.orderNumber}
                      </h3>
                      <p style={styles.orderCustomer}>
                        Customer: {order.user?.name || 'N/A'}
                      </p>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusColor.bg,
                      color: statusColor.color
                    }}>
                      {statusColor.text}
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div style={styles.itemsPreview}>
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <span>{item.quantity}x {item.name}</span>
                        <span>Rs. {item.price * item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <div style={styles.moreItems}>
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                  
                  {/* Order Total */}
                  <div style={styles.orderTotal}>
                    <span>Total Amount:</span>
                    <strong style={styles.totalAmount}>Rs. {order.totalAmount}</strong>
                  </div>
                  
                  {/* Payment Info */}
                  <div style={{
                    ...styles.paymentBadge,
                    backgroundColor: paymentInfo.bg,
                    color: paymentInfo.color
                  }}>
                    <div style={styles.paymentText}>{paymentInfo.text}</div>
                    <div style={styles.paymentDetails}>{paymentInfo.details}</div>
                  </div>
                  
                  {/* Warning Status Display */}
                  {(order.warningCount > 0 || order.strikes > 0 || order.user?.strikes > 0) && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '10px',
                      textAlign: 'center',
                      backgroundColor: 
                        order.warningCount >= 3 ? '#fee2e2' : 
                        order.warningCount === 2 ? '#fef3c7' : 
                        order.warningCount === 1 ? '#dbeafe' : '#f3f4f6',
                      color: 
                        order.warningCount >= 3 ? '#dc2626' : 
                        order.warningCount === 2 ? '#92400e' : 
                        order.warningCount === 1 ? '#1e40af' : '#6b7280',
                      border: '1px solid',
                      borderColor: 
                        order.warningCount >= 3 ? '#fca5a5' : 
                        order.warningCount === 2 ? '#fbbf24' : 
                        '#93c5fd'
                    }}>
                      {order.warningCount >= 3 ? (
                        <>
                          🚨 MAX WARNINGS: {order.warningCount}/3
                          {order.user?.isBlocked && ' | ACCOUNT BLOCKED'}
                        </>
                      ) : order.warningCount > 0 ? (
                        <>
                          ⚠️ Warnings: {order.warningCount}/3
                          {order.strikes > 0 && ` | Order Strikes: ${order.strikes}`}
                        </>
                      ) : order.strikes > 0 ? (
                        `⚠️ Order Strikes: ${order.strikes}`
                      ) : null}
                      
                      {order.user?.strikes > 0 && (
                        <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                          👤 User Total Strikes: {order.user.strikes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STATUS UPDATE BUTTONS */}
                  {statusActions.length > 0 && (
                    <div style={styles.actionsContainer}>
                      {statusActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          style={{
                            ...styles.actionButton,
                            backgroundColor: action.color
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* View Details & Time */}
                  <div style={styles.footer}>
                    <div style={styles.orderTime}>
                      ⏰ {formatTime(order.createdAt)}
                    </div>
                    <button
                      onClick={() => navigate(`/staff/orders/${order._id}`)}
                      style={styles.detailsButton}
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* ========== FOOTER ========== */}
        <div style={styles.footerInfo}>
          <div style={styles.footerText}>
            Total Orders: <strong>{orders.length}</strong> | 
            Auto-refresh: <strong>Every 30 seconds</strong> | 
            Last updated: <strong>{lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : 'N/A'}</strong>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={styles.scrollTopButton}
          >
            ↑ Back to Top
          </button>
        </div>
      </div>
    </StaffLayout>
  );
};

// ==================== STYLES ====================
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '5px 0 0 0'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  dashboardButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  // Stats
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  
  // Search
  searchContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  searchInputContainer: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none'
  },
  clearButton: {
    padding: '12px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  
  // Tabs
  tabsContainer: {
    display: 'flex',
    overflowX: 'auto',
    gap: '10px',
    marginBottom: '30px',
    paddingBottom: '10px'
  },
  tabButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap'
  },
  tabCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  
  // Orders Grid
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  
  // Order Card
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  // Order Header
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  orderTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  orderCustomer: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '5px 0 0 0'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  // Items Preview
  itemsPreview: {
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '6px'
  },
  moreItems: {
    fontSize: '12px',
    color: '#3b82f6',
    textAlign: 'center',
    marginTop: '5px'
  },
  
  // Order Total
  orderTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    color: '#1f2937',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e5e7eb'
  },
  totalAmount: {
    color: '#059669'
  },
  
  // Payment Badge
  paymentBadge: {
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  },
  paymentText: {
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  paymentDetails: {
    fontSize: '12px',
    opacity: 0.8
  },
  
  // Actions
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '15px'
  },
  actionButton: {
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center'
  },
  
  // Footer
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderTime: {
    fontSize: '13px',
    color: '#6b7280'
  },
  detailsButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '2px dashed #d1d5db',
    marginBottom: '30px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '20px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  emptyText: {
    color: '#9ca3af',
    marginBottom: '20px'
  },
  emptyButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '20px',
    color: '#6b7280',
    fontSize: '16px'
  },
  
  // Footer Info
  footerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginTop: '20px'
  },
  footerText: {
    color: '#6b7280',
    fontSize: '14px'
  },
  scrollTopButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default StaffOrders;