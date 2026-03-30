// src/layouts/AdminLayout.jsx
import React from 'react';
import AdminNavbar from '../Components/admin/AdminNavbar';
import Footer from '../Components/staff/StaffFooter';


function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AdminNavbar />
      {/* <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px' }}> */}

          <div style={{ width: '100%', padding: '20px' }}>

        {children}
      </div>
      <Footer/>
    </div>
  );
}

export default AdminLayout;
