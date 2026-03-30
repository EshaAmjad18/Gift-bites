// src/pages/admin/PerformanceReports.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from '../../utils/axiosInstance';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

function PerformanceReports() {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalViolations: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    violationsChange: 0,
    dailyRevenue: [],
    topCafeterias: [],
    recentOrders: []
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/performance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { range: timeRange }
      });
      
      if (response.data.success) {
        setPerformanceData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 7 days';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      minWidth: '250px',
      flex: '1'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: `${color}15`,
          color: color
        }}>
          <Icon size={24} />
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: change >= 0 ? '#059669' : '#dc2626',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {change >= 0 ? <TrendingUp size={16} style={{ marginRight: '4px' }} /> : <TrendingDown size={16} style={{ marginRight: '4px' }} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '4px'
      }}>
        {title === 'Total Revenue' ? formatCurrency(value) : value}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#6b7280'
      }}>
        {title}
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {actions}
        </div>
      </div>
      {children}
    </div>
  );

  const renderRevenueChart = () => (
    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
      {performanceData.dailyRevenue.map((day, index) => (
        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            backgroundColor: '#3b82f6',
            borderRadius: '6px 6px 0 0',
            width: '40px',
            height: `${(day.revenue / Math.max(...performanceData.dailyRevenue.map(d => d.revenue))) * 200}px`,
            minHeight: '4px'
          }} />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            {day.day}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTopCafeterias = () => (
    <div>
      {performanceData.topCafeterias.map((cafe, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          borderBottom: index < performanceData.topCafeterias.length - 1 ? '1px solid #e5e7eb' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontWeight: '600'
            }}>
              {index + 1}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>{cafe.name}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{cafe.orders} orders</div>
            </div>
          </div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>
            {formatCurrency(cafe.revenue)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Performance Reports
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280'
            }}>
              Analytics and insights from your cafeterias
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Time Range Selector */}
            <div style={{ position: 'relative' }}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  padding: '10px 40px 10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  appearance: 'none',
                  minWidth: '160px'
                }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Calendar size={16} style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                pointerEvents: 'none'
              }} />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchPerformanceData}
              style={{
                padding: '10px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <RefreshCw size={16} style={{ marginRight: '8px', color: '#6b7280' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Refresh</span>
            </button>

            {/* Export Button */}
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              <Download size={16} style={{ marginRight: '8px' }} />
              Export Report
            </button>
          </div>
        </div>

        {loading ? (
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
        ) : (
          <>
            {/* Quick Stats */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <StatCard
                title="Total Revenue"
                value={performanceData.totalRevenue}
                change={performanceData.revenueChange}
                icon={DollarSign}
                color="#059669"
              />
              
              <StatCard
                title="Total Orders"
                value={performanceData.totalOrders}
                change={performanceData.ordersChange}
                icon={ShoppingBag}
                color="#3b82f6"
              />
              
              <StatCard
                title="New Users"
                value={performanceData.totalUsers}
                change={performanceData.usersChange}
                icon={Users}
                color="#8b5cf6"
              />
              
              <StatCard
                title="Violations"
                value={performanceData.totalViolations}
                change={performanceData.violationsChange}
                icon={AlertTriangle}
                color="#ef4444"
              />
            </div>

            {/* Charts Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Revenue Chart */}
              <ChartCard 
                title="Revenue Overview"
                actions={
                  <>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Filter size={14} style={{ marginRight: '6px' }} />
                      Filter
                    </button>
                  </>
                }
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{getTimeRangeLabel()}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {formatCurrency(performanceData.totalRevenue)}
                  </div>
                </div>
                {renderRevenueChart()}
              </ChartCard>

              {/* Top Cafeterias */}
              <ChartCard 
                title="Top Performing Cafeterias"
                actions={
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    View All
                  </button>
                }
              >
                {renderTopCafeterias()}
              </ChartCard>
            </div>

            {/* Performance Metrics */}
            <ChartCard title="Performance Metrics">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '8px'
                  }}>
                    {performanceData.totalOrders || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Monthly Orders</div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#3b82f6',
                    marginBottom: '8px'
                  }}>
                    {performanceData.dailyRevenue[performanceData.dailyRevenue.length - 1]?.revenue || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Today's Orders</div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#ef4444',
                    marginBottom: '8px'
                  }}>
                    {performanceData.totalViolations || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Today's Violations</div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#8b5cf6',
                    marginBottom: '8px'
                  }}>
                    {Math.round(performanceData.totalRevenue / Math.max(performanceData.totalOrders, 1))}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Avg. Order Value</div>
                </div>
              </div>
            </ChartCard>

            {/* Recent Orders Table */}
            <ChartCard 
              title="Recent Orders"
              actions={
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  View All Orders
                </button>
              }
            >
              <div style={{
                overflowX: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '2px solid #e5e7eb'
                    }}>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>Order ID</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>Customer</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>Cafeteria</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>Amount</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>Status</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.recentOrders.map((order, index) => (
                      <tr key={index} style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>#{order.id}</td>
                        <td style={{ padding: '12px 16px' }}>{order.customer}</td>
                        <td style={{ padding: '12px 16px' }}>{order.cafeteria}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{formatCurrency(order.amount)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: order.status === 'Completed' ? '#d1fae5' : 
                                          order.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                            color: order.status === 'Completed' ? '#059669' : 
                                  order.status === 'Pending' ? '#d97706' : '#dc2626'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{order.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </>
        )}

        {/* Add CSS for spinner animation */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            select::-ms-expand {
              display: none;
            }
          `}
        </style>
      </div>
    </AdminLayout>
  );
}

export default PerformanceReports;