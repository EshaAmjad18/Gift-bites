
// src/pages/staff/StaffProfile.jsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import { useNavigate } from 'react-router-dom';
import authHelper from '../../utils/authHelper';

function StaffProfile() {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    const fetchStaffProfile = async () => {
      try {
        console.log('🔄 Fetching staff profile...');
        
        const token = authHelper.getToken();
        
        if (!token || !authHelper.isStaff()) {
          console.log('❌ No token or not staff, redirecting to login');
          navigate('/staff/login');
          return;
        }

        console.log('🔑 Token found:', token.substring(0, 20) + '...');
        
        // Debug: Check what's in localStorage
        console.log('📱 localStorage user:', authHelper.getUser());
        
        // Get from localStorage first
        const user = authHelper.getUser();
        if (user) {
          console.log('✅ User from localStorage:', user);
          setStaffData(user);
          setOriginalData(user);
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
          }));
        }

        // Fetch fresh data from API
        console.log('🌐 Making API call to /api/staff/profile');
        
        const response = await fetch('https://gift-bites-production.up.railway.app/api/staff/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 API response:', data);
          
          if (data.success && data.staff) {
            console.log('✅ Staff data received:', data.staff);
            setStaffData(data.staff);
            setOriginalData(data.staff);
            setFormData(prev => ({
              ...prev,
              name: data.staff.name || '',
              email: data.staff.email || '',
              phone: data.staff.phone || ''
            }));
            
            // Update localStorage
            authHelper.setAuthData('staff', token, data.staff);
          } else {
            console.error('❌ API success false:', data.message);
          }
        } else {
          console.error('❌ API failed:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load profile. Please try again.' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setApiLoading(true);

    console.log('🔄 Updating profile...');
    console.log('Form data:', formData);
    console.log('Original data:', originalData);

    try {
      const token = authHelper.getToken();
      
      if (!token) {
        setMessage({ type: 'error', text: 'Please login again' });
        navigate('/staff/login');
        return;
      }

      // 🔒 PROTECT DEMO ACCOUNT - PREVENT PASSWORD CHANGES
      if (formData.email === 'basement_staff@gmail.com' && (formData.currentPassword || formData.newPassword)) {
        setMessage({ 
          type: 'warning', 
          text: '🔒 Demo account is protected. Password changes are disabled for demonstration purposes.' 
        });
        setApiLoading(false);
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        return;
      }

      const updateData = {};

      // Only include fields that have changed
      if (formData.name !== originalData?.name) {
        updateData.name = formData.name;
      }
      
      if (formData.phone !== originalData?.phone) {
        updateData.phone = formData.phone;
      }

      // Add password change if provided
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' });
          setApiLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
          setApiLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'warning', text: 'No changes to update' });
        setApiLoading(false);
        setEditing(false);
        return;
      }

      console.log('📤 Sending update data:', updateData);

      const response = await fetch('https://gift-bites-production.up.railway.app/api/staff/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      console.log('📡 Update response status:', response.status);

      let result;
      try {
        result = await response.json();
        console.log('📦 Update response:', result);
      } catch (jsonError) {
        console.error('❌ JSON parse error:', jsonError);
        const text = await response.text();
        console.error('Raw response:', text);
        setMessage({ 
          type: 'error', 
          text: 'Invalid response from server' 
        });
        setApiLoading(false);
        return;
      }

      if (response.ok && result.success) {
        console.log('✅ Profile updated successfully');
        
        // Update localStorage
        const updatedUser = { 
          ...staffData, 
          name: formData.name, 
          phone: formData.phone 
        };
        authHelper.setAuthData('staff', token, updatedUser);
        
        setStaffData(updatedUser);
        setOriginalData(updatedUser);
        setEditing(false);
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Refresh data from API
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } else {
        console.error('❌ Update failed:', result.message);
        setMessage({ 
          type: 'error', 
          text: result.message || 'Update failed. Please check your current password.' 
        });
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setApiLoading(false);
    }
  };



  const handleCancelEdit = () => {
    setEditing(false);
    // Reset form to original data
    if (originalData) {
      setFormData({
        name: originalData.name || '',
        email: originalData.email || '',
        phone: originalData.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setMessage({ type: '', text: '' });
  };

  // Debug function
  const handleDebug = async () => {
    try {
      const token = authHelper.getToken();
      const response = await fetch('https://gift-bites-production.up.railway.app/api/staff/profile/debug', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('🔍 Debug info:', data);
      alert('Check console for debug info');
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #fb8500',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p>Loading profile...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '30px' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              color: '#023047', 
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Staff Profile
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Manage your account information and settings
            </p>
          </div>
        </div>

        {/* Demo Account Warning Banner */}
        {staffData?.email === 'basement_staff@gmail.com' && (
          <div style={{
            background: '#fff3e0',
            border: '1px solid #fb8500',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>🔒</span>
            <div>
              <strong style={{ color: '#fb8500' }}>Demo Mode</strong>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                This is a demo account. Password changes are disabled for demonstration purposes.
              </p>
            </div>
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div style={{
            background: message.type === 'success' ? '#d1fae5' : 
                       message.type === 'error' ? '#fee2e2' : 
                       message.type === 'warning' ? '#fef3c7' : '#f3f4f6',
            border: `1px solid ${message.type === 'success' ? '#10b981' : 
                               message.type === 'error' ? '#ef4444' : 
                               message.type === 'warning' ? '#f59e0b' : '#d1d5db'}`,
            color: message.type === 'success' ? '#065f46' : 
                   message.type === 'error' ? '#991b1b' : 
                   message.type === 'warning' ? '#92400e' : '#374151',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>
              {message.type === 'success' ? '✅' : 
               message.type === 'error' ? '⚠️' : 
               message.type === 'warning' ? '🔔' : 'ℹ️'}
            </span>
            <span style={{ fontWeight: 'bold' }}>{message.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h2 style={{ fontSize: '24px', color: '#023047', marginBottom: '5px' }}>
                {staffData?.name || 'Staff Member'}
              </h2>
              <div style={{ 
                display: 'inline-block', 
                background: '#f0f9ff',
                color: '#0369a1',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginRight: '10px'
              }}>
                {staffData?.cafeteria || 'Cafeteria Staff'}
              </div>
              <span style={{ 
                color: '#6b7280',
                fontSize: '14px'
              }}>
                ID: {staffData?._id?.substring(0, 8)}...
              </span>
            </div>
            
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #fb8500, #ffb703)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {staffData?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              {/* Left Column - Basic Info */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing || apiLoading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      background: editing && !apiLoading ? 'white' : '#f9fafb',
                      cursor: editing && !apiLoading ? 'text' : 'not-allowed',
                      color: '#1f2937'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      background: '#f9fafb',
                      cursor: 'not-allowed',
                      color: '#4b5563'
                    }}
                  />
                  <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px' }}>
                    Email cannot be changed
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing || apiLoading}
                    placeholder="Add phone number"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      background: editing && !apiLoading ? 'white' : '#f9fafb',
                      cursor: editing && !apiLoading ? 'text' : 'not-allowed',
                      color: '#1f2937'
                    }}
                  />
                </div>
              </div>

              {/* Right Column - Password Change */}
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  color: '#023047',
                  marginBottom: '20px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #f3f4f6'
                }}>
                  Change Password
                </h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    disabled={!editing || apiLoading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      background: editing && !apiLoading ? 'white' : '#f9fafb',
                      cursor: editing && !apiLoading ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={!editing || apiLoading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      background: editing && !apiLoading ? 'white' : '#f9fafb',
                      cursor: editing && !apiLoading ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={!editing || apiLoading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      background: editing && !apiLoading ? 'white' : '#f9fafb',
                      cursor: editing && !apiLoading ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                <p style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>
                  Note: Leave password fields empty if you don't want to change password
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    style={{
                      padding: '12px 24px',
                      background: '#fb8500',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      minWidth: '150px'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#e57800'}
                    onMouseOut={(e) => e.target.style.background = '#fb8500'}
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={apiLoading}
                      style={{
                        padding: '12px 24px',
                        background: apiLoading ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: apiLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        marginRight: '15px',
                        minWidth: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        if (!apiLoading) e.target.style.background = '#0da271';
                      }}
                      onMouseOut={(e) => {
                        if (!apiLoading) e.target.style.background = '#10b981';
                      }}
                    >
                      {apiLoading ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Saving...
                        </>
                      ) : '💾 Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={apiLoading}
                      style={{
                        padding: '12px 24px',
                        background: apiLoading ? '#9ca3af' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: apiLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        minWidth: '150px'
                      }}
                      onMouseOver={(e) => {
                        if (!apiLoading) e.target.style.background = '#4b5563';
                      }}
                      onMouseOut={(e) => {
                        if (!apiLoading) e.target.style.background = '#6b7280';
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </>
                )}
              </div>

            </div>
          </form>
        </div>

        {/* Stats Card */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            color: '#023047',
            marginBottom: '20px'
          }}>
            Account Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={{ 
              background: '#f0f9ff',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #0ea5e9'
            }}>
              <div style={{ fontSize: '14px', color: '#0c4a6e', marginBottom: '5px' }}>Member Since</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}>
                {staffData?.createdAt ? new Date(staffData.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div style={{ 
              background: '#f0fdf4',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: '4px solid #22c55e'
            }}>
              <div style={{ fontSize: '14px', color: '#14532d', marginBottom: '5px' }}>Account Status</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                {staffData?.isBlocked ? '❌ Blocked' : '✅ Active'}
              </div>
            </div>

            <div >
              {/* <div style={{ fontSize: '14px', color: '#78350f', marginBottom: '5px' }}>Last Login</div> */}
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706' }}>
                {/* {staffData?.lastLogin ? new Date(staffData.lastLogin).toLocaleString() : 'Never'} */}
              </div>
            </div>

            <div>
              {/* <div style={{ fontSize: '14px', color: '#4c1d95', marginBottom: '5px' }}>Role</div> */}
              {/* <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7c3aed' }}>
                Staff
              </div> */}
            </div>
          </div>
        </div>

        {/* Support Card */}
        {/* <div style={{ 
          background: 'linear-gradient(45deg, #023047, #219ebc)', 
          padding: '30px', 
          borderRadius: '16px',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Need Help?</h3>
          <p style={{ marginBottom: '20px', opacity: '0.9' }}>
            If you're facing any issues with your account or need assistance, please contact the admin.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              📧 Email Admin
            </button>
            <button
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              📞 Call Support
            </button>
          </div>
        </div> */}
      </div>

    </StaffLayout>
  );
}

export default StaffProfile;