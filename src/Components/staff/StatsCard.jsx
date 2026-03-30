// src/components/staff/StatsCard.jsx
import React from 'react';

function StatsCard({ title, value }) {
  const styles = {
    card: { background: '#023047', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px' },
    title: { fontSize: '16px', fontWeight: 'bold' },
    value: { fontSize: '22px', fontWeight: 'bold', marginTop: '8px' }
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

export default StatsCard;
