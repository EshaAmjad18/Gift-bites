// src/utils/authHelper.js
const authHelper = {
  // Save token based on role
  setAuthData: (role, token, userData) => {
    const tokenKey = `${role}Token`;
    const userKey = `${role}User`;
    
    // Role specific storage
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(userData));
    
    // Generic storage (for backward compatibility)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', role);
    
    console.log(`✅ Auth data saved for ${role}`);
  },

  // Get current user token
  getToken: () => {
    const role = localStorage.getItem('role');
    if (role) {
      const tokenKey = `${role}Token`;
      return localStorage.getItem(tokenKey) || localStorage.getItem('token');
    }
    return localStorage.getItem('token');
  },

  // Get current user data
  getUser: () => {
    const role = localStorage.getItem('role');
    if (role) {
      const userKey = `${role}User`;
      const userStr = localStorage.getItem(userKey) || localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Clear all auth data
  clearAuth: () => {
    const roles = ['user', 'staff', 'admin'];
    roles.forEach(role => {
      localStorage.removeItem(`${role}Token`);
      localStorage.removeItem(`${role}User`);
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!authHelper.getToken();
  },

  // Get current role
  getCurrentRole: () => {
    return localStorage.getItem('role');
  },

  // Check if user is admin
  isAdmin: () => {
    const role = localStorage.getItem('role');
    const user = authHelper.getUser();
    return role === 'admin' || (user && user.role === 'admin');
  },

  // Check if user is staff
  isStaff: () => {
    const role = localStorage.getItem('role');
    const user = authHelper.getUser();
    return role === 'staff' || (user && user.role === 'staff');
  },

  // Check if user is regular user
  isUser: () => {
    const role = localStorage.getItem('role');
    const user = authHelper.getUser();
    return role === 'user' || (user && user.role === 'user');
  },

  // Get staff cafeteria
  getStaffCafeteria: () => {
    const user = authHelper.getUser();
    return user?.cafeteria || null;
  },

  // Logout user
  logout: () => {
    authHelper.clearAuth();
    window.location.href = '/';
  },

  // Get user ID
  getUserId: () => {
    const user = authHelper.getUser();
    return user?._id || null;
  },

  // Get user name
  getUserName: () => {
    const user = authHelper.getUser();
    return user?.name || null;
  },

  // Get user email
  getUserEmail: () => {
    const user = authHelper.getUser();
    return user?.email || null;
  },

  // Check if user is blocked
  isUserBlocked: () => {
    const user = authHelper.getUser();
    return user?.isBlocked || false;
  },

  // Get user strikes
  getUserStrikes: () => {
    const user = authHelper.getUser();
    return user?.strikes || 0;
  },

  // Check if user has pending fines
  hasPendingFines: () => {
    const user = authHelper.getUser();
    return (user?.pendingFines || 0) > 0;
  },

  // Get pending fines amount
  getPendingFines: () => {
    const user = authHelper.getUser();
    return user?.pendingFines || 0;
  }
};

// Add user-specific helpers only
const authHelperUser = {
  getUserToken: () => {
    return localStorage.getItem('userToken') || null;
  },
  getUserData: () => {
    const userStr = localStorage.getItem('userUser');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authHelper;
export { authHelperUser };