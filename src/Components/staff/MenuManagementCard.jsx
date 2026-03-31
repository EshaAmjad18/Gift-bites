

// src/Components/staff/MenuManagementCard.jsx
import React from 'react';

function MenuManagementCard({ item, onToggleAvailability, onAddToToday, onRemoveFromToday, isInTodayMenu }) {
  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${item.available ? '#e5e7eb' : '#fca5a5'}`,
    transition: 'all 0.3s ease',
    marginBottom: '20px',
    position: 'relative',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
    }
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    borderBottom: '1px solid #f3f4f6'
  };

  const infoStyle = {
    flex: 1
  };

  const imageContainerStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginLeft: '20px',
    flexShrink: 0,
    border: '1px solid #e5e7eb'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const noImageStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
    color: '#9ca3af',
    fontSize: '14px'
  };

  const nameStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const hotItemBadgeStyle = {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
    color: '#92400e',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginLeft: '10px'
  };

  const categoryStyle = {
    color: '#6b7280',
    fontSize: '15px',
    marginBottom: '5px'
  };

  const priceStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '5px'
  };

  const availabilityStyle = {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    background: item.available ? '#d1fae5' : '#fee2e2',
    color: item.available ? '#065f46' : '#991b1b'
  };

  const actionsStyle = {
    display: 'flex',
    padding: '20px',
    background: '#f9fafb',
    gap: '10px',
    flexWrap: 'wrap'
  };

  const buttonBaseStyle = {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const todayButtonStyle = {
    ...buttonBaseStyle,
    background: isInTodayMenu ? '#fef3c7' : '#d1fae5',
    color: isInTodayMenu ? '#92400e' : '#065f46'
  };

  const editButtonStyle = {
    ...buttonBaseStyle,
    background: '#dbeafe',
    color: '#1e40af'
  };

  const toggleButtonStyle = {
    ...buttonBaseStyle,
    background: item.available ? '#fee2e2' : '#bbf7d0',
    color: item.available ? '#991b1b' : '#166534'
  };

  const deleteButtonStyle = {
    ...buttonBaseStyle,
    background: '#fee2e2',
    color: '#dc2626'
  };

  return (
    <div style={cardStyle}>
      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {item.isHotItem && (
          <span style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            🔥 Hot
          </span>
        )}
        <span style={availabilityStyle}>
          {item.available ? '✓ Available' : '✗ Unavailable'}
        </span>
      </div>

      <div style={headerStyle}>
        <div style={infoStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={nameStyle}>{item.name}</h3>
          </div>
          
          <p style={categoryStyle}>
            <span style={{ color: '#4b5563', fontWeight: '500' }}>Category:</span> {item.category}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
            <div>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Price</span>
              <div style={priceStyle}>Rs. {item.price}</div>
            </div>
            
            <div>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Status</span>
              <div style={{
                background: item.available ? '#d1fae5' : '#fee2e2',
                color: item.available ? '#065f46' : '#991b1b',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {item.available ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
          </div>
        </div>

        <div style={imageContainerStyle}>
          {item.image ? (
            <img 
              src={`https://gift-bites-production.up.railway.app/uploads/${item.image}`} 
              alt={item.name}
              style={imageStyle}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `
                  <div style="${Object.entries(noImageStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')}">
                    No Image
                  </div>
                `;
              }}
            />
          ) : (
            <div style={noImageStyle}>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>📸</div>
                <div>No Image</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={actionsStyle}>
        <button 
          style={todayButtonStyle}
          onClick={() => isInTodayMenu ? onRemoveFromToday(item._id) : onAddToToday(item._id)}
        >
          {isInTodayMenu ? '🗑️ Remove from Today' : '📅 Add to Today'}
        </button>
        
        <button style={editButtonStyle} onClick={() => window.location.href = `/staff/menu/edit/${item._id}`}>
          ✏️ Edit Item
        </button>
        
        <button style={toggleButtonStyle} onClick={() => onToggleAvailability(item._id)}>
          {item.available ? '⛔ Make Unavailable' : '✅ Make Available'}
        </button>
        
        <button style={deleteButtonStyle} onClick={() => {
          if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            console.log('Delete item:', item._id);
          }
        }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default MenuManagementCard;