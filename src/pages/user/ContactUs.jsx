// src/pages/user/ContactUs.jsx
import React, { useState, useEffect } from 'react';
import UserLayout from '../../layouts/UserLayout';
import Footer from '../../Components/common/Footer';
import { Phone, Mail, MapPin, Clock, Store, ChevronRight } from 'lucide-react';
import axios from '../../utils/axiosInstance';

function ContactUs() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      const response = await axios.get('/api/cafes');
      if (response.data.success) {
        setCafes(response.data.cafes);
      }
    } catch (error) {
      console.error('Error fetching cafes:', error);
      // Fallback data agar API fail ho
      setCafes([
        { 
          name: 'Basement Cafe', 
          phone: '0300-1111111', 
          email: 'basement.staff@gmail.com', 
          location: 'Basement, GIFT University',
          timings: 'Mon-Thurs: 8AM - 5PM | Fri-Sat: 8AM - 9PM'
        },
        { 
          name: 'Food Truck', 
          phone: '0300-2222222', 
          email: 'foodtruck.staff@gmail.com', 
          location: 'Main Lawn, GIFT University',
          timings: 'Mon-Sat: 8AM - 5PM'
        },
        { 
          name: 'Quetta Cafe', 
          phone: '0300-3333333', 
          email: 'quetta.staff@gmail.com', 
          location: 'Near Entrance, GIFT University',
          timings: 'Mon-Sat: 8AM - 5PM'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { 
      padding: '40px 20px', 
      minHeight: '70vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    },
    container: { 
      maxWidth: '1000px', 
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    title: { 
      fontSize: '36px', 
      fontWeight: 'bold', 
      marginBottom: '12px',
      background: 'linear-gradient(135deg, #023047, #0a4d68)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '18px',
      color: '#64748b',
      maxWidth: '600px',
      margin: '0 auto'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '30px',
      marginTop: '20px'
    },
    cafeCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
      border: '1px solid #f0f0f0',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    cafeHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
      paddingBottom: '20px',
      borderBottom: '2px solid #f0f0f0'
    },
    cafeIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #023047, #0a4d68)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    },
    cafeName: { 
      fontSize: '22px', 
      fontWeight: 'bold', 
      color: '#023047',
      marginBottom: '4px'
    },
    cafeStatus: {
      fontSize: '13px',
      color: '#10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      marginBottom: '18px',
      padding: '8px 0',
      borderBottom: '1px dashed #f0f0f0'
    },
    infoIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#023047',
      flexShrink: 0
    },
    infoContent: {
      flex: 1
    },
    infoLabel: {
      fontSize: '12px',
      color: '#94a3b8',
      marginBottom: '2px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '16px',
      color: '#334155',
      fontWeight: '500',
      wordBreak: 'break-word'
    },
    timingsBadge: {
      marginTop: '20px',
      padding: '16px',
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: '1px solid #e5e7eb'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    },
    loader: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #023047',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      animation: 'spin 1s linear infinite'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
      border: '2px dashed #e5e7eb'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      opacity: 0.5
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={styles.page}>
          <div style={styles.container}>
            <div style={styles.loading}>
              <div style={styles.loader}></div>
            </div>
          </div>
        </div>
        <Footer />
      </UserLayout>
    );
  }

  return (
    <>
      <UserLayout>
        <div style={styles.page}>
          <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.title}>
                <Store size={36} color="#023047" />
                Contact Us
              </h1>
              <p style={styles.subtitle}>
                Get in touch with our campus cafes. We're here to help!
              </p>
            </div>
            
            {cafes.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏪</div>
                <h3 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '8px' }}>
                  No cafes available
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Please check back later for cafe information.
                </p>
              </div>
            ) : (
              <div style={styles.grid}>
                {cafes.map((cafe, index) => (
                  <div 
                    key={cafe._id || index} 
                    style={styles.cafeCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 30px 50px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.05)';
                    }}
                  >
                    {/* Cafe Header */}
                    <div style={styles.cafeHeader}>
                      <div style={styles.cafeIcon}>
                        {cafe.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={styles.cafeName}>{cafe.name}</h3>
                        <span style={styles.cafeStatus}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            display: 'inline-block'
                          }}></span>
                          Open Now
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      {/* Phone */}
                      <div style={styles.infoRow}>
                        <div style={styles.infoIcon}>
                          <Phone size={18} />
                        </div>
                        <div style={styles.infoContent}>
                          <div style={styles.infoLabel}>Phone</div>
                          <div style={styles.infoValue}>
                            <a href={`tel:${cafe.phone}`} style={{ color: '#023047', textDecoration: 'none' }}>
                              {cafe.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div style={styles.infoRow}>
                        <div style={styles.infoIcon}>
                          <Mail size={18} />
                        </div>
                        <div style={styles.infoContent}>
                          <div style={styles.infoLabel}>Email</div>
                          <div style={styles.infoValue}>
                            <a href={`mailto:${cafe.email}`} style={{ color: '#023047', textDecoration: 'none' }}>
                              {cafe.email}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div style={styles.infoRow}>
                        <div style={styles.infoIcon}>
                          <MapPin size={18} />
                        </div>
                        <div style={styles.infoContent}>
                          <div style={styles.infoLabel}>Location</div>
                          <div style={styles.infoValue}>{cafe.location}</div>
                        </div>
                      </div>
                    </div>

                    {/* Timings */}
                    {(cafe.timings || cafe.timings !== '') && (
                      <div style={styles.timingsBadge}>
                        <Clock size={20} color="#023047" />
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Working Hours</div>
                          <div style={{ fontSize: '14px', color: '#023047', fontWeight: '500' }}>
                            {cafe.timings || 'Mon-Fri: 9AM - 9PM'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </UserLayout>
      <Footer />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          a:hover {
            text-decoration: underline !important;
          }
        `}
      </style>
    </>
  );
}

export default ContactUs;