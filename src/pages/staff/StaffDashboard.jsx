// src/pages/staff/StaffDashboard.jsx - SIMPLE WORKING VERSION
import React, { useEffect, useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout';

function StaffDashboard() {
  const [stats, setStats] = useState({
    dailySales: 0,
    todayOrders: 0,
    activeOrders: 0,
    totalOrders: 0,
    weeklyRevenue: 0,
    pendingRefunds: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('staffToken') || localStorage.getItem('token');
      
      // Try multiple endpoints
      const endpoints = [
        '/staff/dashboard',
        '/staff/orders/stats',
        '/staff/stats'
      ];
      
      let data = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(`http://localhost:5000/api${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ ${endpoint} response:`, result);
            
            if (result.success && result.data) {
              data = result.data;
              break;
            } else if (result) {
              data = result;
              break;
            }
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }
      
      if (!data) {
        // Fallback: Fetch orders and calculate manually
        await calculateStatsManually();
        return;
      }
      
      // Set stats from API data
      setStats({
        dailySales: data.dailySales || data.todayRevenue || 0,
        todayOrders: data.todayOrders || data.dailyOrders || 0,
        activeOrders: data.activeOrders || 0,
        totalOrders: data.totalOrders || 0,
        weeklyRevenue: data.weeklyRevenue || data.weeklySales || 0,
        pendingRefunds: data.pendingRefunds || 0
      });
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Try manual calculation
      await calculateStatsManually();
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsManually = async () => {
    try {
      console.log('📊 Calculating stats manually...');
      const token = localStorage.getItem('staffToken') || localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/staff/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const orders = result.data || result || [];
        
        console.log(`📦 Found ${orders.length} orders`);
        
        // Calculate today's date
        const today = new Date().toDateString();
        
        // Filter today's orders
        const todayOrders = orders.filter(order => {
          if (!order.createdAt) return false;
          return new Date(order.createdAt).toDateString() === today;
        });
        
        // Calculate stats
        const dailySales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const activeOrders = orders.filter(order => 
          ['accepted', 'preparing', 'ready'].includes(order.status)
        ).length;
        
        // Get pending refunds
        const pendingRefunds = orders.filter(order => 
          ['cancelled', 'rejected'].includes(order.status) && 
          (order.refundStatus !== 'completed')
        ).length;
        
        // Calculate weekly revenue (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyOrders = orders.filter(order => {
          if (!order.createdAt) return false;
          return new Date(order.createdAt) >= weekAgo && 
                 !['cancelled', 'rejected'].includes(order.status);
        });
        const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        console.log('📈 Manual stats calculated:', {
          dailySales,
          todayOrders: todayOrders.length,
          activeOrders,
          totalOrders: orders.length,
          weeklyRevenue,
          pendingRefunds
        });
        
        setStats({
          dailySales,
          todayOrders: todayOrders.length,
          activeOrders,
          totalOrders: orders.length,
          weeklyRevenue,
          pendingRefunds
        });
      }
    } catch (error) {
      console.error('Manual calculation failed:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount) => {
    return `PKR ${amount?.toFixed(2) || '0.00'}`;
  };

  // Simple Card Component
  const Card = ({ title, value, icon, color }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: `1px solid ${color}`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{icon}</div>
      <h3 style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        margin: 0,
        color: color 
      }}>
        {title.includes('Sales') || title.includes('Revenue') 
          ? formatCurrency(value) 
          : value}
      </p>
    </div>
  );

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#666' }}>Loading dashboard...</p>
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
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
          Staff Dashboard
        </h1>
        
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <Card
            title="Daily Sales"
            value={stats.dailySales}
            icon="💰"
            color="#28a745"
          />
          
          <Card
            title="Today's Orders"
            value={stats.todayOrders}
            icon="📦"
            color="#007bff"
          />
          
          <Card
            title="Active Orders"
            value={stats.activeOrders}
            icon="⏳"
            color="#ffc107"
          />
          
          <Card
            title="Total Orders"
            value={stats.totalOrders}
            icon="📊"
            color="#6f42c1"
          />
          
          <Card
            title="Weekly Revenue"
            value={stats.weeklyRevenue}
            icon="📈"
            color="#dc3545"
          />
          
          <Card
            title="Pending Refunds"
            value={stats.pendingRefunds}
            icon="🔄"
            color="#fd7e14"
          />
        </div>
        
        {/* Quick Info */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          {/* <h3 style={{ marginTop: 0, color: '#495057' }}>📋 Quick Info</h3> */}
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Last updated: {new Date().toLocaleString()}
          </p>
          <button 
            onClick={fetchDashboardStats}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
    
      </div>
    </StaffLayout>
  );
}

export default StaffDashboard;