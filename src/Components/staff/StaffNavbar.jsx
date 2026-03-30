
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StaffNavbar() {
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  // Get current path for active link highlighting
  const currentPath = window.location.pathname;

  const isActive = (path) => {
    return currentPath === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    navigate('/');
  };

  // Navigation items
  const navItems = [
    { path: '/staff/dashboard', label: '📊 Dashboard' },
    { path: '/staff/menu', label: '📋 Menu Items' },
    { path: '/staff/menu/today', label: '🍽️ Today\'s Menu' },
    { path: '/staff/orders', label: '🛒 Orders' },
    { path: '/staff/refunds', label: '↩️ Refunds' },
    { path: '/staff/profile', label: '👤 Profile' },
  ];

  const styles = {
    bar: {
      background: '#023047',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      flexWrap: 'wrap', // Responsive: items wrap on small screens
      gap: '10px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'transform 0.3s'
    },
    logoText: {
      fontWeight: 'bold',
      fontSize: '22px',
      background: 'linear-gradient(90deg, #fb8500, #ffb703)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    logoIcon: {
      fontSize: '24px',
      color: '#ffb703',
    },
    staffBadge: {
      fontSize: '12px',
      background: 'rgba(251,133,0,0.2)',
      padding: '4px 10px',
      borderRadius: '20px',
      color: '#fb8500',
      marginLeft: '8px',
      border: '1px solid rgba(251,133,0,0.3)'
    },
    links: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      flexWrap: 'wrap', // Responsive: links wrap on small screens
      justifyContent: 'center',
      flex: '1 1 auto',
      margin: '0 10px'
    },
    link: {
      cursor: 'pointer',
      fontWeight: '500',
      padding: '8px 14px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      whiteSpace: 'nowrap'
    },
    activeLink: {
      background: '#fb8500',
      fontWeight: 'bold',
      color: 'white'
    },
    linkHover: {
      background: 'rgba(251,133,0,0.2)'
    },
    logout: {
      background: 'linear-gradient(90deg, #fb8500, #e63946)',
      border: 'none',
      padding: '10px 22px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      color: 'white',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(251,133,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap'
    },
    logoutHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(251,133,0,0.4)'
    }
  };

  const getLinkStyle = (path) => {
    const baseStyle = { ...styles.link };
    if (isActive(path)) {
      Object.assign(baseStyle, styles.activeLink);
    }
    if (hoveredLink === path && !isActive(path)) {
      Object.assign(baseStyle, styles.linkHover);
    }
    return baseStyle;
  };

  return (
    <div style={styles.bar}>
      {/* Logo */}
      <div 
        style={styles.logo}
        onClick={() => navigate('/staff/dashboard')}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={styles.logoIcon}>🎁</span>
        <span style={styles.logoText}>Gift Bites</span>
        <span style={styles.staffBadge}>Staff</span>
      </div>

      {/* Navigation Links - will wrap on small screens */}
      <div style={styles.links}>
        {navItems.map((item) => (
          <span 
            key={item.path}
            style={getLinkStyle(item.path)}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredLink(item.path)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        style={{
          ...styles.logout,
          ...(isLogoutHovered ? styles.logoutHover : {})
        }}
        onClick={handleLogout}
        onMouseEnter={() => setIsLogoutHovered(true)}
        onMouseLeave={() => setIsLogoutHovered(false)}
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
}

export default StaffNavbar;