// src/components/admin/AdminNavbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminNavbar() {
  const navigate = useNavigate();

  const styles = {
    bar: {
      background: '#023047',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
    },
    links: { display: 'flex', gap: '20px' },
    link: { cursor: 'pointer', fontWeight: '500' },
    logout: {
      background: '#fb8500',
      border: 'none',
      padding: '8px 14px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.bar}>
      <div style={{ fontWeight: 'bold', fontSize: '20px' }}>
        Gift Bites – Admin
      </div>

      <div style={styles.links}>
        <span style={styles.link} onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
        <span style={styles.link} onClick={() => navigate('/admin/users')}>Users</span>
        {/* <span style={styles.link} onClick={() => navigate('/admin/performance')}>Performance Reports</span> */}


      </div>

      <button style={styles.logout} onClick={() => navigate('/')}>
        Logout
      </button>
    </div>
  );
}

export default AdminNavbar;
