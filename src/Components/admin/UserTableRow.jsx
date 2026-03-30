// src/components/admin/UserTableRow.jsx
import React from 'react';

function UserTableRow({ user, onBlockToggle, onResetStrikes }) {
  const handleBlockClick = () => {
    onBlockToggle(user._id, user.isBlocked, user.name);
  };

  const handleResetStrikes = () => {
    onResetStrikes(user._id, user.name);
  };

  return (
    <tr style={{ 
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: user.isBlocked ? '#fff5f5' : 'white'
    }}>
      <td style={{ padding: '15px', verticalAlign: 'top' }}>
        <div>
          <div style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '16px' }}>
            {user.name}
            {user.strikes > 0 && (
              <span style={{ 
                marginLeft: '8px',
                fontSize: '12px',
                backgroundColor: '#f6ad55',
                color: '#744210',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                ⚠️ {user.strikes}/3 strikes
              </span>
            )}
          </div>
          <div style={{ color: '#718096', fontSize: '14px', marginTop: '5px' }}>
            {user.email}
          </div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '12px', color: '#a0aec0' }}>
            <span>ID: {user.studentId}</span>
            {user.phone && <span>📞 {user.phone}</span>}
          </div>
          <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '5px' }}>
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </td>

      <td style={{ padding: '15px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Total Orders</div>
            <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{user.totalOrders || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Total Spent</div>
            <div style={{ fontWeight: 'bold', color: '#2d3748' }}>PKR {user.totalSpent || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Fines</div>
            <div style={{ fontWeight: 'bold', color: '#e53e3e' }}>PKR {user.pendingFines || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Violations</div>
            <div style={{ fontWeight: 'bold', color: '#d69e2e' }}>{user.violations || 0}</div>
          </div>
        </div>
      </td>

      <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <span style={{ 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: user.isBlocked ? '#fed7d7' : '#c6f6d5',
            color: user.isBlocked ? '#9b2c2c' : '#276749',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {user.isBlocked ? '🚫 Blocked' : '✅ Active'}
          </span>
          {user.strikes > 0 && (
            <div style={{ 
              padding: '4px 8px', 
              backgroundColor: '#feebc8',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#744210'
            }}>
              {user.strikes} strike{user.strikes !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </td>

      <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleBlockClick}
            style={{
              padding: '8px 16px',
              background: user.isBlocked ? '#38a169' : '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '80px'
            }}
          >
            {user.isBlocked ? 'Unblock' : 'Block'}
          </button>
          
          {user.strikes > 0 && (
            <button
              onClick={handleResetStrikes}
              style={{
                padding: '8px 12px',
                background: '#ed8936',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Reset strikes to 0"
            >
              ⚡ Reset
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default UserTableRow;