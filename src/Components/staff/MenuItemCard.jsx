import React from 'react';

function MenuItemCard({ item, onToggle }) {
  return (
    <div style={{
      background: 'white',
      padding: '15px',
      borderRadius: '12px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div>
        <strong>{item.name}</strong>
        <div>{item.category}</div>
        <div>Rs. {item.price}</div>
        {item.isHotItem && <span style={{ color: 'red' }}>🔥 Hot</span>}
      </div>

      <button
        onClick={() => onToggle(item._id)}
        style={{
          background: item.available ? '#ef4444' : '#16a34a',
          color: 'white',
          border: 'none',
          padding: '8px',
          borderRadius: '6px'
        }}>
        {item.available ? 'Mark Unavailable' : 'Mark Available'}
      </button>
    </div>
  );
}

export default MenuItemCard;

