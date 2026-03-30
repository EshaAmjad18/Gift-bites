// src/layouts/StaffLayout.jsx
import React from 'react';
import StaffNavbar from '../Components/staff/StaffNavbar';
import Footer from '../Components/staff/StaffFooter';

function StaffLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <StaffNavbar />

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '20px' }}>
          {/* <div style={{ width: '100%', padding: '20px' }}> */}

        {children}

      </div>

      <Footer />
    </div>
  );
}

export default StaffLayout;
