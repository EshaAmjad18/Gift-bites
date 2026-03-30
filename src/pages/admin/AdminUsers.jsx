





import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from '../../utils/axiosInstance';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    phone: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search }
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleBlockToggle = async (userId, currentStatus, userName) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/admin/users/${userId}/toggle-block`,
        { isBlocked: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        fetchUsers();
        showMessage('success', `User ${action}ed successfully`);
      }
    } catch (error) {
      console.error('Error toggling block:', error);
      showMessage('error', 'Failed to update user status');
    }
  };

  const handleResetStrikes = async (userId, userName) => {
    if (!window.confirm(`Reset strikes for ${userName}? This will set strikes to 0.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/admin/users/${userId}/reset-strikes`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        fetchUsers();
        showMessage('success', 'Strikes reset successfully');
      }
    } catch (error) {
      console.error('Error resetting strikes:', error);
      showMessage('error', 'Failed to reset strikes');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    } else if (newUser.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!newUser.studentId.trim()) {
      errors.studentId = 'Student ID is required';
    }
    
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/users/create', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showMessage('success', 'User created successfully!');
        setShowAddForm(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.message) {
        showMessage('error', error.response.data.message);
      } else {
        showMessage('error', 'Failed to create user');
      }
    }
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      studentId: '',
      password: '',
      phone: '',
      role: 'user'
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isBlocked).length;
    const blockedUsers = users.filter(u => u.isBlocked).length;
    const usersWithStrikes = users.filter(u => u.strikes > 0).length;
    const totalFines = users.reduce((sum, user) => sum + (user.pendingFines || 0), 0);
    const totalSpent = users.reduce((sum, user) => sum + (user.totalSpent || 0), 0);
    
    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      usersWithStrikes,
      totalFines,
      totalSpent
    };
  };

  const stats = calculateStats();

  return (
    <AdminLayout>
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto' 
        }}>
          
          {/* Message Alert */}
          {message.text && (
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '500'
            }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '25px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h1 style={{ 
                color: '#1e293b', 
                fontSize: '32px', 
                fontWeight: 'bold', 
                margin: '0 0 5px 0'
              }}>
                👥 User Management
              </h1>
              <p style={{ 
                color: '#64748b', 
                fontSize: '16px',
                margin: 0
              }}>
                Manage system users, block accounts, and reset strikes
              </p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ 
                padding: '12px 24px', 
                background: showAddForm ? '#64748b' : '#1e293b', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '15px',
                transition: 'all 0.3s',
                height: 'fit-content'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {showAddForm ? '✖️ Cancel' : '➕ Add New User'}
            </button>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              color="#3b82f6"
              icon="👥"
            />
            <StatCard 
              title="Active Users" 
              value={stats.activeUsers} 
              color="#10b981"
              icon="✅"
            />
            <StatCard 
              title="Blocked Users" 
              value={stats.blockedUsers} 
              color="#ef4444"
              icon="🚫"
            />
            <StatCard 
              title="Users with Strikes" 
              value={stats.usersWithStrikes} 
              color="#f59e0b"
              icon="⚠️"
            />
           
          </div>

          {/* Search Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginBottom: '25px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search users by name, email, or student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px 16px 12px 45px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '18px'
              }}>
                🔍
              </span>
            </div>
            <button 
              onClick={fetchUsers}
              style={{ 
                padding: '12px 24px', 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.background = '#2563eb'}
              onMouseLeave={(e) => e.target.background = '#3b82f6'}
            >
              Search
            </button>
            <button 
              onClick={() => {
                setSearch('');
                fetchUsers();
              }}
              style={{ 
                padding: '12px 24px', 
                background: '#94a3b8', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.background = '#64748b'}
              onMouseLeave={(e) => e.target.background = '#94a3b8'}
            >
              Clear
            </button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ 
                color: '#1e293b', 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '25px',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '15px'
              }}>
                📝 Add New User
              </h2>
              
              <form onSubmit={handleAddUser}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '25px',
                  marginBottom: '30px'
                }}>
                  {/* Name */}
                  <FormField
                    label="Full Name *"
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    error={formErrors.name}
                  />

                  {/* Email */}
                  <FormField
                    label="Email Address *"
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                    error={formErrors.email}
                  />

                  {/* Student ID */}
                  <FormField
                    label="Student ID *"
                    type="text"
                    name="studentId"
                    value={newUser.studentId}
                    onChange={handleInputChange}
                    placeholder="e.g., 231370057"
                    error={formErrors.studentId}
                  />

                  {/* Password */}
                  <FormField
                    label="Password *"
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="At least 6 characters"
                    error={formErrors.password}
                  />

                  {/* Phone */}
                  <FormField
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    placeholder="0300-1234567"
                  />

                  {/* Role */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      color: '#475569',
                      fontWeight: '600',
                      fontSize: '15px'
                    }}>
                      Role
                    </label>
                    <div style={{ 
                      padding: '14px 16px', 
                      borderRadius: '8px', 
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontSize: '15px'
                    }}>
                      User (Default)
                    </div>
                    <small style={{ 
                      color: '#94a3b8', 
                      fontSize: '13px', 
                      display: 'block', 
                      marginTop: '8px',
                      lineHeight: '1.4'
                    }}>
                      Only 'user' role can be created from admin panel
                    </small>
                  </div>
                </div>

                {/* Form Actions */}
                <div style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  justifyContent: 'flex-end',
                  paddingTop: '25px',
                  borderTop: '2px solid #f1f5f9'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    style={{ 
                      padding: '14px 28px', 
                      background: '#cbd5e1', 
                      color: '#475569', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.background = '#94a3b8'}
                    onMouseLeave={(e) => e.target.background = '#cbd5e1'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ 
                      padding: '14px 28px', 
                      background: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.background = '#059669'}
                    onMouseLeave={(e) => e.target.background = '#10b981'}
                  >
                    ✅ Create User
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          {loading ? (
            <LoadingSpinner text="Loading users..." />
          ) : users.length === 0 ? (
            <EmptyState 
              title="No Users Found"
              message={search ? 'Try a different search term' : 'Click "Add New User" to create first user'}
            />
          ) : (
            <>
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                marginBottom: '25px'
              }}>
                <TableHeader 
                  totalUsers={users.length}
                  blockedUsers={stats.blockedUsers}
                  usersWithStrikes={stats.usersWithStrikes}
                  onRefresh={fetchUsers}
                />
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    minWidth: '1000px',
                    tableLayout: 'fixed'
                  }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ 
                          padding: '18px 20px', 
                          textAlign: 'left', 
                          color: '#475569', 
                          borderBottom: '2px solid #e2e8f0',
                          fontWeight: '600',
                          fontSize: '14px',
                          width: '50%'  // Increased width since statistics column removed
                        }}>User Details</th>
                        <th style={{ 
                          padding: '18px 20px', 
                          textAlign: 'center', 
                          color: '#475569', 
                          borderBottom: '2px solid #e2e8f0',
                          fontWeight: '600',
                          fontSize: '14px',
                          width: '25%'  // Increased width
                        }}>Status</th>
                        <th style={{ 
                          padding: '18px 20px', 
                          textAlign: 'center', 
                          color: '#475569', 
                          borderBottom: '2px solid #e2e8f0',
                          fontWeight: '600',
                          fontSize: '14px',
                          width: '25%'  // Increased width
                        }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <UserTableRow
                          key={user._id}
                          user={user}
                          onBlockToggle={handleBlockToggle}
                          onResetStrikes={handleResetStrikes}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Footer */}
              <div style={{ 
                backgroundColor: '#f1f5f9', 
                borderRadius: '12px',
                padding: '25px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#475569',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📊 Summary
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '90px' 
                }}>
                  <SummaryItem label="Total Users" value={stats.totalUsers} />
                  <SummaryItem label="Active Users" value={stats.activeUsers} color="#10b981" />
                  <SummaryItem label="Blocked Users" value={stats.blockedUsers} color="#ef4444" />
                 
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ======================
// HELPER COMPONENTS
// ======================

const StatCard = ({ title, value, color, icon }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: `1px solid ${color}20`,
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  }}>
    <div style={{
      backgroundColor: `${color}20`,
      borderRadius: '10px',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
    </div>
    <div>
      <div style={{ 
        fontSize: '14px', 
        color: '#64748b', 
        marginBottom: '5px',
        fontWeight: '500'
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: color 
      }}>
        {value}
      </div>
    </div>
  </div>
);

const FormField = ({ label, type, name, value, onChange, placeholder, error }) => (
  <div>
    <label style={{ 
      display: 'block', 
      marginBottom: '10px', 
      color: '#475569',
      fontWeight: '600',
      fontSize: '15px'
    }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ 
        width: '100%',
        padding: '14px 16px', 
        borderRadius: '8px', 
        border: `1px solid ${error ? '#ef4444' : '#cbd5e1'}`,
        fontSize: '15px',
        transition: 'all 0.3s',
        boxSizing: 'border-box'
      }}
      onFocus={(e) => e.target.style.borderColor = error ? '#ef4444' : '#3b82f6'}
      onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : '#cbd5e1'}
    />
    {error && (
      <span style={{ 
        color: '#ef4444', 
        fontSize: '13px', 
        marginTop: '8px', 
        display: 'block',
        fontWeight: '500'
      }}>
        ⚠️ {error}
      </span>
    )}
  </div>
);

const LoadingSpinner = ({ text }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #f1f5f9',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    }}></div>
    <p style={{ 
      color: '#64748b', 
      fontSize: '16px',
      fontWeight: '500'
    }}>{text}</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const EmptyState = ({ title, message }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '60px 20px', 
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '2px dashed #cbd5e1'
  }}>
    <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.7 }}>👤</div>
    <h3 style={{ 
      color: '#475569', 
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '10px' 
    }}>
      {title}
    </h3>
    <p style={{ 
      color: '#94a3b8', 
      fontSize: '15px',
      maxWidth: '400px',
      margin: '0 auto',
      lineHeight: '1.5'
    }}>
      {message}
    </p>
  </div>
);

const TableHeader = ({ totalUsers, blockedUsers, usersWithStrikes, onRefresh }) => (
  <div style={{ 
    padding: '20px 25px',
    backgroundColor: '#1e293b',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div>
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
        Total Users: {totalUsers}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.8 }}>
        {blockedUsers} blocked • {usersWithStrikes} with strikes
      </div>
    </div>
    <button 
      onClick={onRefresh}
      style={{ 
        padding: '8px 16px', 
        background: 'rgba(255,255,255,0.15)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s'
      }}
      onMouseEnter={(e) => e.target.background = 'rgba(255,255,255,0.25)'}
      onMouseLeave={(e) => e.target.background = 'rgba(255,255,255,0.15)'}
    >
      🔄 Refresh
    </button>
  </div>
);

const UserTableRow = ({ user, onBlockToggle, onResetStrikes }) => {
  const handleBlockClick = () => {
    onBlockToggle(user._id, user.isBlocked, user.name);
  };

  const handleResetStrikes = () => {
    onResetStrikes(user._id, user.name);
  };

  return (
    <tr style={{ 
      borderBottom: '1px solid #f1f5f9',
      backgroundColor: user.isBlocked ? '#fef2f2' : 'white',
      transition: 'background-color 0.3s'
    }}>
      {/* User Details */}
      <td style={{ padding: '20px', verticalAlign: 'top' }}>
        <div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: '#1e293b', 
              fontSize: '16px' 
            }}>
              {user.name}
            </div>
            {user.strikes > 0 && (
              <div style={{ 
                fontSize: '12px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '3px 8px',
                borderRadius: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⚠️ {user.strikes}/3
              </div>
            )}
          </div>
          <div style={{ 
            color: '#64748b', 
            fontSize: '14px', 
            marginBottom: '5px' 
          }}>
            {user.email}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginTop: '12px', 
            fontSize: '13px', 
            color: '#94a3b8' 
          }}>
            <span>ID: {user.studentId}</span>
            {user.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                📞 {user.phone}
              </span>
            )}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8', 
            marginTop: '8px' 
          }}>
            Joined: {new Date(user.createdAt).toLocaleDateString('en-PK', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '20px', textAlign: 'center', verticalAlign: 'top' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <div style={{ 
            padding: '8px 16px', 
            borderRadius: '20px', 
            background: user.isBlocked ? '#fee2e2' : '#dcfce7',
            color: user.isBlocked ? '#991b1b' : '#166534',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {user.isBlocked ? '🚫 Blocked' : '✅ Active'}
          </div>
          {user.strikes > 0 && (
            <div style={{ 
              padding: '6px 12px', 
              backgroundColor: '#fffbeb',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#92400e',
              fontWeight: '500'
            }}>
              {user.strikes} strike{user.strikes !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </td>

      {/* Actions */}
      <td style={{ padding: '20px', textAlign: 'center', verticalAlign: 'top' }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleBlockClick}
            style={{
              padding: '10px 20px',
              background: user.isBlocked ? '#10b981' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              minWidth: '100px',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.target.opacity = '0.9'}
            onMouseLeave={(e) => e.target.opacity = '1'}
          >
            {user.isBlocked ? '✅ Unblock' : '🚫 Block'}
          </button>
          
          {user.strikes > 0 && (
            <button
              onClick={handleResetStrikes}
              style={{
                padding: '10px 16px',
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.target.background = '#ea580c'}
              onMouseLeave={(e) => e.target.background = '#f97316'}
              title="Reset strikes to 0"
            >
              ⚡ Reset Strikes
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const SummaryItem = ({ label, value, color = '#475569' }) => (
  <div>
    <div style={{ 
      fontSize: '13px', 
      color: '#64748b', 
      marginBottom: '6px',
      fontWeight: '500'
    }}>
      {label}
    </div>
    <div style={{ 
      fontSize: '18px', 
      fontWeight: 'bold', 
      color: color
    }}>
      {value}
    </div>
  </div>
);

export default AdminUsers;