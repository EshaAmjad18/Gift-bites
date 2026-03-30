
// src/components/user/CafeteriaSelector.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';

function CafeteriaSelector({ selectedCafe, onChange }) {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      const response = await axios.get('/api/cafes');
      if (response.data.success) {
        setCafes(response.data.cafes || []);
      }
    } catch (error) {
      console.error('Error fetching cafeterias:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { 
      background: 'white', 
      padding: '16px', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      marginBottom: '20px' 
    },
    select: { 
      width: '100%', 
      padding: '10px', 
      fontSize: '16px', 
      borderRadius: '8px', 
      border: '2px solid #ddd' 
    },
    loading: {
      padding: '12px',
      textAlign: 'center',
      color: '#6b7280'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Select Cafeteria</label>
        <div style={styles.loading}>Loading cafeterias...</div>
      </div>
    );
  }

  if (cafes.length === 0) {
    return (
      <div style={styles.container}>
        <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Select Cafeteria</label>
        <div style={styles.loading}>No cafeterias available</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Select Cafeteria</label>
      <select 
        style={styles.select} 
        value={selectedCafe} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select a cafeteria</option>
        {cafes.map((cafe) => (
          <option key={cafe._id} value={cafe._id}>
            {cafe.name} 
          </option>
        ))}
      </select>
    </div>
  );
}

export default CafeteriaSelector;