// src/pages/staff/EditMenuItem.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';
import authHelper from '../../utils/authHelper'; // ✅ Import authHelper

function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    isHotItem: false,
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');

  const categories = ['Breakfast', 'Lunch', 'Fast Food', 'Beverages', 'Desserts', 'Drinks', 'Paratha'];

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      const token = authHelper.getToken(); // ✅ Get token
      
      if (!token) {
        setError('Please login first');
        navigate('/staff/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/staff/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ Add authorization header
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Loading item with ID:', id);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Loaded data:', data);
      
      if (data.success && data.items) {
        const item = data.items.find(item => item._id === id);
        console.log('Found item:', item);
        
        if (item) {
          setForm({
            name: item.name || '',
            category: item.category || '',
            price: item.price || '',
            isHotItem: item.isHotItem || false,
            image: null,
          });
          
          if (item.image) {
            const imageUrl = `http://localhost:5000/uploads/${item.image}`;
            console.log('Setting image URL:', imageUrl);
            setCurrentImage(imageUrl);
            setPreview(imageUrl);
          }
        } else {
          throw new Error('Item not found');
        }
      } else {
        throw new Error(data.message || 'Failed to load menu');
      }
    } catch (error) {
      console.error('Error loading item:', error);
      setError('Failed to load item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
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
    
    setSaving(true);
    setError('');

    try {
      const token = authHelper.getToken(); // ✅ Get token
      
      if (!token) {
        setError('Please login first');
        navigate('/staff/login');
        return;
      }

      const data = new FormData();
      data.append('name', form.name);
      data.append('category', form.category);
      data.append('price', form.price);
      data.append('isHotItem', form.isHotItem);
      
      if (form.image) {
        data.append('image', form.image);
      }

      console.log('Updating item ID:', id);
      console.log('Form data:', {
        name: form.name,
        category: form.category,
        price: form.price,
        isHotItem: form.isHotItem,
        hasImage: !!form.image
      });

      const response = await fetch(`http://localhost:5000/api/staff/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ Add authorization header
          // Note: Don't set Content-Type for FormData, browser sets it automatically
        },
        body: data
      });

      console.log('Update response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('Update response:', result);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        const text = await response.text();
        console.error('Raw response:', text);
        throw new Error('Invalid response from server');
      }
      
      if (response.ok && result.success) {
        alert('✅ Item Updated Successfully!');
        navigate('/staff/menu');
      } else {
        setError(result.message || `Failed to update item (Status: ${response.status})`);
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          authHelper.clearAuth();
          navigate('/staff/login');
        }
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      const token = authHelper.getToken();
      
      const response = await fetch(`http://localhost:5000/api/staff/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Item deleted successfully!');
        navigate('/staff/menu');
      } else {
        alert(result.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #fb8500',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '10px', color: '#666' }}>Loading item...</p>
        </div>
      </StaffLayout>
    );
  }

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ 
              fontSize: '32px', 
              color: '#023047', 
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Edit Menu Item
            </h2>
            <button
              onClick={handleDelete}
              style={{
                padding: '10px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete Item
            </button>
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Item ID: <span style={{ fontFamily: 'monospace' }}>{id}</span>
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

              {/* Right Column - Image */}
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
                  padding: '20px',
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
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <label style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}>
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(currentImage || null);
                            setForm({ ...form, image: null });
                            setError('');
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
                          Remove New Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '15px' }}>
                        📸
                      </div>
                      <p style={{ color: '#6b7280', marginBottom: '10px', fontSize: '16px' }}>
                        {currentImage ? 'Current image will be kept' : 'Drag & drop or click to upload'}
                      </p>
                      {currentImage && (
                        <div style={{ marginBottom: '20px' }}>
                          <img
                            src={currentImage}
                            alt="Current"
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '10px'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div style="
                                  width: 100px;
                                  height: 100px;
                                  background: #f3f4f6;
                                  border-radius: 8px;
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  color: #9ca3af;
                                  margin-bottom: 10px;
                                ">
                                  No Image
                                </div>
                              `;
                            }}
                          />
                          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                            Current Image
                          </p>
                        </div>
                      )}
                      <label style={{
                        background: '#fb8500',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}>
                        {currentImage ? 'Upload New Image' : 'Browse Files'}
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
                  * Optional. Recommended size: 500x500px, max 5MB
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ 
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              gap: '15px'
            }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: saving ? '#9ca3af' : '#023047',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  if (!saving) e.target.style.background = '#1e3a8a';
                }}
                onMouseOut={(e) => {
                  if (!saving) e.target.style.background = '#023047';
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Updating...
                  </>
                ) : (
                  '💾 Update Item'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/staff/menu')}
                style={{
                  padding: '16px 30px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = '#d1d5db'}
                onMouseOut={(e) => e.target.style.background = '#e5e7eb'}
              >
                Cancel
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
            💡 Editing Tips:
          </h4>
          <ul style={{ color: '#374151', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Update item details as needed</li>
            <li style={{ marginBottom: '8px' }}>Upload a new image to replace the current one</li>
            <li style={{ marginBottom: '8px' }}>Mark popular items as "Hot" for better visibility</li>
            <li style={{ marginBottom: '8px' }}>Adjust prices according to market rates</li>
            <li>Changes will be reflected immediately in the menu</li>
          </ul>
        </div>
      </div>

      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Optional: Add focus styles globally */
        input:focus, select:focus {
          outline: none;
          border-color: #fb8500;
          box-shadow: 0 0 0 3px rgba(251, 133, 0, 0.1);
        }
      `}</style>
    </StaffLayout>
  );
}

export default EditMenuItem;