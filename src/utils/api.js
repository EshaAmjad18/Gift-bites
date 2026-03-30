//src/utils/api.js

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// CREATE AXIOS INSTANCE
const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

//ATTACH TOKEN TO ALL REQUESTS
API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("staffToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🔑 Request sent:", config.method, config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

//  RESPONSE INTERCEPTOR FOR ERROR HANDLING
API.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

// ================================
// STAFF ORDER FUNCTIONS
// ================================

// Get all orders for staff's cafeteria
export const getStaffOrders = () => {
  return API.get("/staff/orders");
};

// Get today's categorized orders
export const getTodayOrders = () => {
  return API.get("/staff/orders/today");
};

// Get order statistics
export const getOrderStats = () => {
  return API.get("/staff/orders/stats");
};

// Option 2: Simplest working version
export const updateOrderStatus = async (orderId, status) => {
  console.log("📡 Sending status update...", { orderId, status });

  const token =
    localStorage.getItem("staffToken") || localStorage.getItem("token");

  return fetch(`http://localhost:5000/api/staff/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })
    .then((response) => {
      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    })
    .then((data) => {
      console.log("✅ Update successful:", data);
      return { data };
    })
    .catch((error) => {
      console.error("❌ Update failed:", error);
      throw error;
    });
};

// Send warning to user
// export const sendWarning = (orderId) => {
//   return API.post(`/staff/orders/${orderId}/warning`);
// };

// Send warning to user - UPDATED VERSION
export const sendWarning = async (orderId) => {
  try {
    console.log('📡 Sending warning for order:', orderId);
    
    const token = localStorage.getItem("staffToken") || localStorage.getItem("token");
    
    const response = await fetch(`http://localhost:5000/api/staff/orders/${orderId}/warning`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📥 Warning response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Warning response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: Failed to send warning`);
    }
    
    return { data };
    
  } catch (error) {
    console.error('❌ Send warning API error:', error);
    throw error;
  }
};




export const markCashPayment = async (orderId) => {
  try {
    console.log("💰 Marking cash payment for order:", orderId);

    //Use the correct endpoint
    const response = await API.put(`/staff/orders/${orderId}/cash-payment`);

    console.log("✅ Cash payment API response:", response.data);

    // Return FULL response
    return response;
  } catch (error) {
    console.error("❌ Cash payment error:", {
      message: error.message,
      response: error.response?.data,
    });

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to mark cash payment";

    throw new Error(errorMessage);
  }
};

// ================================
// STAFF MENU FUNCTIONS
// ================================
export const getStaffMenu = () => {
  return API.get("/staff/menu");
};

export const updateMenuItem = (itemId, data) => {
  return API.put(`/staff/menu/${itemId}`, data);
};

export const addMenuItem = (data) => {
  return API.post("/staff/menu", data);
};

export const deleteMenuItem = (itemId) => {
  return API.delete(`/staff/menu/${itemId}`);
};

// ================================
// STAFF DASHBOARD FUNCTIONS
// ================================
export const getStaffDashboard = () => {
  return API.get("/staff/dashboard");
};

export const getSalesReport = (startDate, endDate) => {
  return API.get(`/staff/sales?start=${startDate}&end=${endDate}`);
};

export const getPendingCashRefunds = async () => {
  const response = await API.get("/staff/refunds/pending");
  console.log("API getPendingCashRefunds response:", response.data); // Debug
  return response;
};

export const markCashRefundComplete = async (orderId) => {
  const response = await API.post(`/staff/refunds/${orderId}/complete`);
  console.log("API markCashRefundComplete response:", response.data); // Debug
  return response;
};

export const getRefundStats = async () => {
  const response = await API.get("/staff/refunds/stats");
  console.log("API getRefundStats response:", response.data); // Debug
  return response;
};

// ================================
// ADMIN USER FUNCTIONS
// ================================

// Get all users (admin)
export const getAllUsers = (search = "") => {
  return API.get("/admin/users", {
    params: { search },
  });
};

// Create new user (admin)
export const createUser = (userData) => {
  return API.post("/admin/users/create", userData);
};

// Get user by ID (admin)
export const getUserById = (userId) => {
  return API.get(`/admin/users/${userId}`);
};

// Update user (admin)
export const updateUser = (userId, userData) => {
  return API.put(`/admin/users/${userId}`, userData);
};

// Toggle block status (admin)
export const toggleBlockUser = (userId, isBlocked) => {
  return API.put(`/admin/users/${userId}/toggle-block`, { isBlocked });
};

// Reset user strikes (admin)
export const resetUserStrikes = (userId) => {
  return API.put(`/admin/users/${userId}/reset-strikes`);
};

// Delete user (admin)
export const deleteUser = (userId) => {
  return API.delete(`/admin/users/${userId}`);
};

// Get user statistics (admin)
export const getUserStats = () => {
  return API.get("/admin/users/stats");
};

// ================================
// ADMIN DASHBOARD FUNCTIONS
// ================================

// Get admin dashboard data
export const getAdminDashboard = () => {
  return API.get("/admin/dashboard");
};

// Get all staffs and cafeterias data
export const getAllStaffsDashboard = () => {
  return API.get("/admin/dashboard/all-staffs");
};

export default API;
