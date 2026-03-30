// src/components/admin/AddUserForm.jsx - CREATE NEW FILE
import React, { useState } from 'react';
import { createUser } from '../../utils/api';

function AddUserForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    phone: '',
    role: 'user'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await createUser(formData);
      
      if (response.data.success) {
        alert('User created successfully!');
        onSuccess();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create user' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      studentId: '',
      password: '',
      phone: '',
      role: 'user'
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const inputStyles = (fieldName) => ({
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: `1px solid ${errors[fieldName] ? '#e53e3e' : '#ddd'}`,
    fontSize: '14px',
    boxSizing: 'border-box'
  });

  const labelStyles = {
    display: 'block',
    marginBottom: '8px',
    color: '#4a5568',
    fontWeight: '500'
  };

  const errorStyles = {
    color: '#e53e3e',
    fontSize: '12px',
    marginTop: '5px',
    display: 'block'
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '25px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{
        color: '#2d3748',
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '20px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '10px'
      }}>
        📝 Add New User
      </h2>

      {errors.submit && (
        <div style={{
          backgroundColor: '#fed7d7',
          color: '#9b2c2c',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #fc8181'
        }}>
          ⚠️ {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}>
          {/* Name */}
          <div>
            <label style={labelStyles}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              style={inputStyles('name')}
              disabled={loading}
            />
            {errors.name && <span style={errorStyles}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyles}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              style={inputStyles('email')}
              disabled={loading}
            />
            {errors.email && <span style={errorStyles}>{errors.email}</span>}
          </div>

          {/* Student ID */}
          <div>
            <label style={labelStyles}>Student ID *</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., 231370057"
              style={inputStyles('studentId')}
              disabled={loading}
            />
            {errors.studentId && <span style={errorStyles}>{errors.studentId}</span>}
          </div>

          {/* Password */}
          <div>
            <label style={labelStyles}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              style={inputStyles('password')}
              disabled={loading}
            />
            {errors.password && <span style={errorStyles}>{errors.password}</span>}
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyles}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0300-1234567"
              style={inputStyles('phone')}
              disabled={loading}
            />
          </div>

          {/* Role */}
          <div>
            <label style={labelStyles}>Role</label>
            <div style={{
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: '#f7fafc',
              border: '1px solid #e2e8f0',
              color: '#4a5568'
            }}>
              User (Default)
            </div>
            <small style={{ color: '#718096', fontSize: '12px', display: 'block', marginTop: '5px' }}>
              Only 'user' role can be created
            </small>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#a0aec0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#38a169',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Creating...' : '✅ Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUserForm;