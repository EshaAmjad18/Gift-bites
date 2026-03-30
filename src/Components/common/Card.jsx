import React from 'react';

function Card({ children, className = '' }) {
  const style = {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  };

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}

export default Card;