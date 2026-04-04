
// src/pages/user/UserHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import Footer from '../../Components/common/Footer';
import { Clock, Shield, Truck, CreditCard, Coffee, Utensils, Store } from 'lucide-react';
import axios from '../../utils/axiosInstance';

function UserHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Fetch user stats
      if (token) {
        try {
          const statsResponse = await axios.get('/api/user/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (statsResponse.data.success) {
            setStats(statsResponse.data);
          }
        } catch (statsError) {
          console.log('Stats fetch failed (optional):', statsError.message);
        }
      }
      
      // ✅ FIXED: Use correct cafes endpoint
      console.log('📡 Fetching cafes from /api/user/menu/cafeterias...');
      const cafesResponse = await axios.get('/user/menu/cafeterias');
      
      console.log('✅ Cafes API Response:', cafesResponse.data);
      
      if (cafesResponse.data.success) {
        // ✅ Check response structure
        const cafesData = cafesResponse.data.cafeterias || cafesResponse.data.data || [];
        console.log('🎯 Cafes found:', cafesData);
        setCafes(Array.isArray(cafesData) ? cafesData : []);
      } else {
        console.error('❌ Cafes API response not successful:', cafesResponse.data);
        setCafes([]);
        setError('Failed to load cafeterias');
      }
      
    } catch (error) {
      console.error('❌ Error fetching home data:', error);
      console.error('Error response:', error.response?.data);
      
      // ✅ FALLBACK: Show hardcoded cafes if API fails
      setCafes([
        {
          _id: '1',
          name: 'Basement Cafe',
          description: 'Fresh snacks and beverages',
          emoji: '🏢',
          timings: '8:00 AM - 10:00 PM',
          isActive: true
        },
        {
          _id: '2', 
          name: 'Food Truck',
          description: 'Street food delights',
          emoji: '🚚',
          timings: '10:00 AM - 8:00 PM',
          isActive: true
        },
        {
          _id: '3',
          name: 'Quetta Cafe',
          description: 'Traditional Pakistani cuisine',
          emoji: '🍛',
          timings: '9:00 AM - 9:00 PM',
          isActive: true
        }
      ]);
      setError('Using demo cafeterias. Real data will load when backend is connected.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    hero: {
      background: 'linear-gradient(135deg, rgba(2,48,71,0.9) 0%, rgba(251,133,0,0.8) 100%), url("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop") center/cover',
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '40px 20px',
    },
    heroContent: { 
      maxWidth: '800px',
      backdropFilter: 'blur(2px)',
      padding: '40px',
      borderRadius: '20px',
      backgroundColor: 'rgba(0,0,0,0.2)'
    },
    heroTitle: { 
      fontSize: '48px', 
      fontWeight: 'bold', 
      marginBottom: '20px', 
      lineHeight: '1.2',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    heroSubtitle: { 
      fontSize: '20px', 
      marginBottom: '30px', 
      opacity: 0.9,
      lineHeight: '1.6'
    },
    heroBtns: { 
      display: 'flex', 
      gap: '20px', 
      justifyContent: 'center', 
      flexWrap: 'wrap' 
    },
    btnPrimary: { 
      background: '#fb8500', 
      color: 'white', 
      border: 'none', 
      padding: '15px 40px', 
      fontSize: '18px', 
      fontWeight: 'bold', 
      borderRadius: '50px', 
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(251, 133, 0, 0.3)',
      ':hover': { 
        transform: 'translateY(-3px)', 
        boxShadow: '0 6px 20px rgba(251, 133, 0, 0.4)',
        background: '#ff9500'
      }
    },
    btnSecondary: { 
      background: 'transparent', 
      color: 'white', 
      border: '2px solid white', 
      padding: '15px 40px', 
      fontSize: '18px', 
      fontWeight: 'bold', 
      borderRadius: '50px', 
      cursor: 'pointer',
      transition: 'all 0.3s',
      ':hover': { 
        background: 'rgba(255,255,255,0.15)', 
        transform: 'translateY(-3px)',
        boxShadow: '0 4px 15px rgba(255,255,255,0.2)'
      }
    },
    section: { 
      padding: '80px 20px', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    },
    sectionTitle: { 
      fontSize: '36px', 
      fontWeight: 'bold', 
      textAlign: 'center', 
      color: '#023047', 
      marginBottom: '50px',
      position: 'relative',
      paddingBottom: '15px'
    },
    sectionTitleUnderline: {
      content: '""',
      position: 'absolute',
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80px',
      height: '4px',
      background: '#fb8500',
      borderRadius: '2px'
    },
    featuresGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '30px', 
      marginBottom: '60px' 
    },
    featureCard: { 
      background: 'white', 
      padding: '35px 25px', 
      borderRadius: '16px', 
      textAlign: 'center', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
      transition: 'all 0.3s',
      cursor: 'pointer',
      border: '1px solid #f0f0f0',
      ':hover': { 
        transform: 'translateY(-10px)', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
      }
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '25px',
      marginBottom: '40px'
    },
    statCard: {
      background: 'white',
      padding: '28px 20px',
      borderRadius: '16px',
      textAlign: 'center',
      boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
      border: '1px solid #f0f0f0',
      transition: 'transform 0.3s',
      ':hover': {
        transform: 'translateY(-5px)'
      }
    },
    cafesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '30px',
      marginTop: '30px'
    },
    cafeCard: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      transition: 'all 0.3s',
      border: '1px solid #f0f0f0',
      ':hover': { 
        transform: 'translateY(-8px)', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
      }
    },
    loadingContainer: {
      textAlign: 'center',
      gridColumn: '1/-1',
      padding: '60px 20px'
    },
    spinner: {
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3b82f6',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    },
    errorCard: {
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '30px',
      textAlign: 'center',
      color: '#92400e'
    },
    refreshButton: {
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      marginTop: '15px',
      fontSize: '14px',
      transition: 'all 0.3s',
      ':hover': {
        background: '#2563eb'
      }
    }
  };

  const features = [
    { 
      icon: <Clock size={32} />, 
      title: 'Skip the Queue', 
      desc: 'Order in advance and collect without waiting in long lines',
      color: '#3b82f6'
    },
    { 
      icon: <Shield size={32} />, 
      title: 'Secure Payment', 
      desc: 'Multiple payment options with Stripe security',
      color: '#10b981'
    },
    { 
      icon: <Truck size={32} />, 
      title: 'Quick Pickup', 
      desc: 'Get notified instantly when your order is ready',
      color: '#8b5cf6'
    },
    { 
      icon: <CreditCard size={32} />, 
      title: 'Easy Refunds', 
      desc: 'Instant refunds for cancelled orders via Stripe',
      color: '#f59e0b'
    },
  ];

  const getCafeIcon = (cafeName) => {
    const icons = {
      'Basement Cafe': <Store size={48} />,
      'Food Truck': <Truck size={48} />,
      'Quetta Cafe': <Coffee size={48} />,
      'default': <Utensils size={48} />
    };
    
    return icons[cafeName] || icons.default;
  };

  return (
    <>
      <UserLayout>
        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Order Your Favorite Food<br />Skip the Queue! 🍔</h1>
            <p style={styles.heroSubtitle}>
              Browse menus, place orders in advance, and collect when ready.<br />
              No more waiting in long cafeteria lines!
            </p>
            <div style={styles.heroBtns}>
              <button style={styles.btnPrimary} onClick={() => navigate('/user/menu')}>🍽️ Order Now</button>
              {/* <button style={styles.btnSecondary} onClick={() => navigate('/user/menu')}>📋 View All Menus</button> */}
            </div>
          </div>
        </div>

        {/* User Stats */}
        {stats && (
          <div style={{ ...styles.section, paddingTop: '40px', paddingBottom: '40px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <h2 style={{...styles.sectionTitle, color: '#1e293b'}}>Your Stats 📊</h2>
            <div style={{position: 'relative', marginBottom: '15px'}}>
              <div style={styles.sectionTitleUnderline}></div>
            </div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
                  {stats.totalOrders || 0}
                </div>
                <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>Total Orders</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
                  {stats.completedOrders || 0}
                </div>
                <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>Completed</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '10px' }}>
                  Rs. {stats.totalSpent?.toLocaleString() || 0}
                </div>
                <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>Total Spent</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '10px' }}>
                  {stats.favoriteItems || 0}
                </div>
                <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>Favorites</div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Why Choose Gift Bites? ✨</h2>
          <div style={{position: 'relative', marginBottom: '15px'}}>
            <div style={styles.sectionTitleUnderline}></div>
          </div>
          <div style={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} style={styles.featureCard} onClick={() => navigate('/user/menu')}>
                <div style={{ 
                  color: f.color, 
                  marginBottom: '25px', 
                  display: 'flex', 
                  justifyContent: 'center',
                  background: `${f.color}15`,
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  alignItems: 'center',
                  margin: '0 auto 25px'
                }}>
                  {f.icon}
                </div>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: '#1e293b', 
                  marginBottom: '15px', 
                  fontSize: '22px' 
                }}>
                  {f.title}
                </div>
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '15px', 
                  lineHeight: '1.7',
                  padding: '0 10px'
                }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cafeterias Section - IMPROVED */}
        <div style={{ ...styles.section, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
          <h2 style={styles.sectionTitle}>Our Cafeterias 🏪</h2>
          <div style={{position: 'relative', marginBottom: '15px'}}>
            <div style={styles.sectionTitleUnderline}></div>
          </div>
          
          {error && (
            <div style={styles.errorCard}>
              <div style={{fontWeight: 'bold', marginBottom: '8px'}}>⚠️ Note:</div>
              <div>{error}</div>
              <button 
                style={styles.refreshButton}
                onClick={fetchHomeData}
              >
                🔄 Try Again
              </button>
            </div>
          )}

          <div style={styles.cafesGrid}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#64748b', fontSize: '16px', marginTop: '15px' }}>
                  Loading cafeterias...
                </p>
              </div>
            ) : cafes.length === 0 ? (
              <div style={{...styles.loadingContainer, color: '#64748b'}}>
                <div style={{fontSize: '64px', marginBottom: '20px'}}>🏢</div>
                <h3 style={{color: '#1e293b', marginBottom: '10px', fontSize: '24px'}}>No Cafeterias Available</h3>
                <p style={{maxWidth: '500px', margin: '0 auto 20px', lineHeight: '1.6'}}>
                  All cafeterias are currently closed or not available.
                  Please check back later or contact support.
                </p>
                <button 
                  style={styles.refreshButton}
                  onClick={fetchHomeData}
                >
                  🔄 Refresh
                </button>
              </div>
            ) : (
              cafes.map((cafe, index) => (
                <div key={cafe._id || index} style={styles.cafeCard}>
                  <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #023047 0%, #fb8500 100%)',
                    color: 'white',
                    position: 'relative'
                  }}>
                    <div style={{ fontSize: '72px', opacity: 0.9 }}>
                      {cafe.emoji || '🏢'}
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      padding: '6px 14px',
                      backgroundColor: cafe.isActive ? '#10b981' : '#dc2626',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'white'
                      }}></div>
                      {cafe.isActive ? 'OPEN' : 'CLOSED'}
                    </div>
                  </div>
                  
                  <div style={{ padding: '25px' }}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: '#1e293b', 
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      {getCafeIcon(cafe.name)}
                      <span>{cafe.name}</span>
                    </div>
                    
                    <div style={{ 
                      color: '#64748b', 
                      fontSize: '15px', 
                      marginBottom: '15px',
                      lineHeight: '1.6',
                      minHeight: '48px'
                    }}>
                      {cafe.description || 'Delicious food served fresh daily by our chefs.'}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      marginBottom: '20px'
                    }}>
                      {cafe.timings && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          color: '#475569',
                          fontSize: '14px'
                        }}>
                          <Clock size={16} />
                          <span>{cafe.timings}</span>
                        </div>
                      )}
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        color: '#475569',
                        fontSize: '14px'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          📍
                        </div>
                        <span>{cafe.location || 'GIFT University Campus'}</span>
                      </div>
                    </div>
                    
                    <button 
                      style={{ 
                        background: 'linear-gradient(135deg, #023047 0%, #1e40af 100%)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '14px 24px', 
                        borderRadius: '10px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold', 
                        width: '100%',
                        fontSize: '16px',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        ':hover': { 
                          background: 'linear-gradient(135deg, #fb8500 0%, #ea580c 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(251, 133, 0, 0.3)'
                        }
                      }} 
                      onClick={() => navigate(`/user/menu?cafe=${cafe._id || cafe.name}`)}
                    >
                      🍽️ View Menu & Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {cafes.length > 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <p style={{color: '#64748b', fontSize: '15px', marginBottom: '15px'}}>
                👆 Select any cafeteria to view today's menu and place your order
              </p>
              <button
                style={{
                  background: 'transparent',
                  color: '#3b82f6',
                  border: '2px solid #3b82f6',
                  padding: '12px 30px',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.3s',
                  ':hover': {
                    background: '#3b82f6',
                    color: 'white'
                  }
                }}
                onClick={() => navigate('/user/menu')}
              >
                🗺️ View All Cafeterias
              </button>
            </div>
          )}
        </div>
      </UserLayout>
  
      <Footer/>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

export default UserHome;