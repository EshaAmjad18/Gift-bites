import React from 'react';

function Button({ children, onClick, variant = 'primary', className = '' }) {
  const variants = {
    primary: { background: '#023047', color: 'white' },
    secondary: { background: '#fb8500', color: 'white' },
    outline: { background: 'transparent', border: '2px solid #023047', color: '#023047' },
    danger: { background: '#ef4444', color: 'white' },
  };

  const style = {
    ...variants[variant],
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  };

  return (
    <button style={style} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export default Button;