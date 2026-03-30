// src/pages/admin/AdminDashboard.jsx - UPDATE THIS FILE
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

function AdminDashboard() {
  const [allStaffsData, setAllStaffsData] = useState({
    cafeterias: [],
    totalStats: {},
    loading: true
  });
  const [systemOverview, setSystemOverview] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllStaffsData();
    fetchSystemOverview();
  }, []);

  const fetchAllStaffsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard/all-staffs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAllStaffsData({
            cafeterias: result.data.cafeterias || [],
            totalStats: result.data.totalStats || {},
            loading: false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching staffs data:', error);
      setAllStaffsData(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchSystemOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSystemOverview(result.data.systemOverview || {});
        }
      }
    } catch (error) {
      console.error('Error fetching system overview:', error);
    }
  };

  const formatCurrency = (amount) => {
    return `PKR ${parseFloat(amount).toFixed(2)}`;
  };

  const CafeteriaCard = ({ cafeteria, stats, staff }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      border: '1px solid #e0e0e0'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#2c3e50',
          margin: 0
        }}>
          🏪 {cafeteria}
        </h3>
        <div style={{
          backgroundColor: '#3498db',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {staff.length} Staff Member{staff.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Staff List */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>
          👥 Assigned Staff:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {staff.map((s, index) => (
            <div key={index} style={{
              backgroundColor: '#f8f9fa',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontWeight: 'bold' }}>{s.name}</div>
              <div style={{ color: '#6c757d', fontSize: '11px' }}>{s.email}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '15px',
        marginTop: '15px'
      }}>
        <StatBox title="Today's Sales" value={formatCurrency(stats.dailySales)} />
        <StatBox title="Today's Orders" value={stats.todayOrders} />
        <StatBox title="Active Orders" value={stats.activeOrders} />
        <StatBox title="Weekly Revenue" value={formatCurrency(stats.weeklyRevenue)} />
        <StatBox title="Total Orders" value={stats.totalOrders} />
        <StatBox title="Pending Refunds" value={stats.pendingRefunds} />
      </div>
    </div>
  );

  const StatBox = ({ title, value }) => (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid #dee2e6'
    }}>
      <div style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#2c3e50',
        marginBottom: '5px'
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: '#6c757d',
        fontWeight: '500'
      }}>
        {title}
      </div>
    </div>
  );

  const TotalStatsCard = ({ title, value, icon, color }) => (
    <div style={{
      backgroundColor: color,
      color: 'white',
      padding: '25px',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '36px', marginBottom: '15px' }}>{icon}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        {title}
      </div>
    </div>
  );

  if (allStaffsData.loading) {
    return (
      <AdminLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '80vh'
        }}>
          <div>Loading admin dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '10px'
          }}>
            👑 Admin Dashboard
          </h1>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
            Monitor all cafeterias and staff performance
          </p>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'overview' ? '#2c3e50' : 'white',
              color: activeTab === 'overview' ? 'white' : '#2c3e50',
              border: '2px solid #2c3e50',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📊 System Overview
          </button>
          <button
            onClick={() => setActiveTab('staffs')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'staffs' ? '#2c3e50' : 'white',
              color: activeTab === 'staffs' ? 'white' : '#2c3e50',
              border: '2px solid #2c3e50',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            👥 All Staffs & Cafeterias
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' ? (
          <>
            {/* Total Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <TotalStatsCard
                title="Total Today's Sales"
                value={formatCurrency(allStaffsData.totalStats.totalDailySales || 0)}
                icon="💰"
                color="#27ae60"
              />
              <TotalStatsCard
                title="Total Today's Orders"
                value={allStaffsData.totalStats.totalTodayOrders || 0}
                icon="📦"
                color="#2980b9"
              />
              <TotalStatsCard
                title="Total Cafeterias"
                value={allStaffsData.totalStats.totalCafeterias || 0}
                icon="🏪"
                color="#8e44ad"
              />
              <TotalStatsCard
                title="Total Staff"
                value={allStaffsData.totalStats.totalStaff || 0}
                icon="👥"
                color="#e74c3c"
              />
            </div>

            {/* System Overview */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                marginBottom: '20px'
              }}>
                🖥️ System Overview
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <h4 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' }}>Total Users</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {systemOverview.totalUsers || 0}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' }}>Total Today's Revenue</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                    {formatCurrency(systemOverview.totalRevenue || 0)}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' }}>Cancelled Orders</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                    {systemOverview.cancelledOrders || 0}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' }}>Pending Refunds</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                    {systemOverview.pendingRefunds || 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* All Cafeterias Section */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                marginBottom: '20px'
              }}>
                🏪 All Cafeterias Performance
              </h2>
              
              {allStaffsData.cafeterias.length === 0 ? (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '40px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
                  <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No Cafeterias Found</h3>
                  <p style={{ color: '#adb5bd' }}>No cafeteria data available</p>
                </div>
              ) : (
                <div>
                  {allStaffsData.cafeterias.map((cafe, index) => (
                    <CafeteriaCard
                      key={index}
                      cafeteria={cafe.cafeteria}
                      stats={cafe.stats}
                      staff={cafe.staff}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div style={{
              backgroundColor: '#2c3e50',
              color: 'white',
              padding: '25px',
              borderRadius: '10px',
              marginTop: '30px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: '#ecf0f1'
              }}>
                📋 Summary
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
                    Total Daily Sales (All Cafeterias)
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {formatCurrency(allStaffsData.totalStats.totalDailySales || 0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
                    Total Orders Today
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {allStaffsData.totalStats.totalTodayOrders || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
                    Active Orders
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {allStaffsData.totalStats.totalActiveOrders || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
                    Pending Refunds
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {allStaffsData.totalStats.totalPendingRefunds || 0}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Last Updated */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#95a5a6',
          fontSize: '14px',
          paddingTop: '20px',
          borderTop: '1px solid #ecf0f1'
        }}>
          Last updated: {new Date().toLocaleString()}
          <button 
            onClick={() => {
              setAllStaffsData(prev => ({ ...prev, loading: true }));
              fetchAllStaffsData();
              fetchSystemOverview();
            }}
            style={{
              marginLeft: '20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;