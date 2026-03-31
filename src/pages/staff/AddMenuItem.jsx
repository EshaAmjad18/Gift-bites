// src/pages/staff/AddMenuItem.jsx
import React, { useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import { useNavigate } from 'react-router-dom';
import authHelper from '../../utils/authHelper';

function AddMenuItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    isHotItem: false,
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const categories = ['Breakfast', 'Lunch', 'Fast Food', 'Beverages', 'Desserts', 'Drinks', 'Paratha'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPG, PNG, GIF images are allowed');
        return;
      }
      
      setForm({ ...form, image: file });
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Use authHelper to get token
    const token = authHelper.getToken();
    
    console.log('🔍 Debug - Token Check:');
    console.log('Token from authHelper:', token);
    console.log('Current role:', authHelper.getCurrentRole());
    console.log('User data:', authHelper.getUser());
    console.log('All localStorage:', Object.keys(localStorage));
    
    if (!token) {
      setError('You are not logged in. Please login first.');
      navigate('/staff/login');
      return;
    }
    
    // Check if user is actually staff
    if (!authHelper.isStaff()) {
      setError('Access denied. Staff login required.');
      authHelper.clearAuth();
      navigate('/staff/login');
      return;
    }
    
    if (!form.name.trim()) {
      setError('Item name is required');
      return;
    }
    
    if (!form.category.trim()) {
      setError('Category is required');
      return;
    }
    
    if (!form.price || parseFloat(form.price) <= 0) {
      setError('Valid price is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('category', form.category);
      data.append('price', form.price);
      data.append('isHotItem', form.isHotItem);
      
      // Add cafeteria info
      const staffCafeteria = authHelper.getStaffCafeteria();
      if (staffCafeteria) {
        data.append('cafeteria', staffCafeteria);
      }
      
      if (form.image) {
        data.append('image', form.image);
      }

      console.log('Sending menu item request...');
      
      const response = await fetch('https://gift-bites-production.up.railway.app/api/staff/menu', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data
      });

      console.log('Response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('Response:', result);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        const text = await response.text();
        console.log('Raw response:', text);
        throw new Error('Invalid response from server');
      }

      if (response.ok && result.success !== false) {
        alert('✅ Item Added Successfully!');
        navigate('/staff/menu');
      } else {
        setError(result.message || `Request failed with status ${response.status}`);
        // If token expired, clear auth
        if (response.status === 401) {
          authHelper.clearAuth();
          navigate('/staff/login');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <StaffLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => navigate('/staff/menu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: '#666',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            ← Back to Menu
          </button>
          <h2 style={{ 
            fontSize: '32px', 
            color: '#023047', 
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            Add New Menu Item
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Add a new item to your cafeteria menu
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span style={{ fontWeight: 'bold' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Left Column */}
              <div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#fb8500'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="e.g., Chicken Biryani"
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#fb8500'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Price (Rs) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#fb8500'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="e.g., 250.00"
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '25px'
                }}>
                  <input
                    type="checkbox"
                    id="isHotItem"
                    name="isHotItem"
                    checked={form.isHotItem}
                    onChange={handleChange}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '10px',
                      accentColor: '#fb8500'
                    }}
                  />
                  <label htmlFor="isHotItem" style={{ 
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    Mark as Hot Item
                  </label>
                  <span style={{ 
                    marginLeft: '10px',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    (Will be highlighted with 🔥)
                  </span>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#374151'
                }}>
                  Item Image
                </label>
                
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  transition: 'border-color 0.3s',
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {preview ? (
                    <div style={{ width: '100%' }}>
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          marginBottom: '20px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setForm({ ...form, image: null });
                        }}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '15px' }}>
                        📸
                      </div>
                      <p style={{ color: '#6b7280', marginBottom: '10px', fontSize: '16px' }}>
                        Drag & drop or click to upload
                      </p>
                      <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>
                        PNG, JPG up to 5MB
                      </p>
                      <label style={{
                        background: '#fb8500',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'inline-block',
                        fontSize: '16px'
                      }}>
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </>
                  )}
                </div>
                
                <p style={{ 
                  color: '#6b7280', 
                  marginTop: '10px',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  * Optional. Recommended for better customer appeal
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ 
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '2px solid #e5e7eb'
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#9ca3af' : '#023047',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.background = '#1e3a8a';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.background = '#023047';
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Adding Item...
                  </>
                ) : (
                  'Add Menu Item'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div style={{
          marginTop: '30px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h4 style={{ 
            color: '#1e40af',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💡 Tips for adding items:
          </h4>
          <ul style={{ color: '#374151', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Use clear, descriptive names</li>
            <li style={{ marginBottom: '8px' }}>Add high-quality images for better appeal</li>
            <li style={{ marginBottom: '8px' }}>Mark popular items as "Hot" for visibility</li>
            <li style={{ marginBottom: '8px' }}>Set competitive prices</li>
            <li>Remember to add items to "Today's Menu" after creating</li>
          </ul>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </StaffLayout>
  );
}

export default AddMenuItem;