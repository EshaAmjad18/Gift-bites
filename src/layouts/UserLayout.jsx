// src/layouts/UserLayout.jsx
import React from 'react';
import Navbar from '../Components/common/Navbar';


function UserLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar cartCount={0} /> {/* default 0, ya CartContext se connect kar sakte ho */}
          <div style={{ width: '100%', padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

export default UserLayout;
