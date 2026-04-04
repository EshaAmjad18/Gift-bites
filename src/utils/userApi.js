// src/utils/userApi.js
import userAPI from './userAxios';

// ========== MENU FUNCTIONS ==========
export const fetchAllCafeterias = async () => {
  try {
    const response = await userAPI.get('/user/menu/cafeterias');
    return response.data;
  } catch (error) {
    console.error('Error fetching cafeterias:', error);
    throw error;
  }
};

export const fetchTodayMenu = async (cafeteriaName) => {
  try {
    const response = await userAPI.get(`/user/menu/${cafeteriaName}/today`);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

export const checkCafeteriaHours = async (cafeteriaName) => {
  try {
    const response = await userAPI.get(`/user/menu/${cafeteriaName}/hours`);
    return response.data;
  } catch (error) {
    console.error('Error checking hours:', error);
    throw error;
  }
};

// ========== CART FUNCTIONS ==========
export const fetchCart = async () => {
  try {
    const response = await userAPI.get('/user/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addItemToCart = async (itemId, quantity) => {
  try {
    const response = await userAPI.post('/user/cart/add', {
      itemId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await userAPI.put(`/user/cart/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeCartItem = async (itemId) => {
  try {
    const response = await userAPI.delete(`/user/cart/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await userAPI.delete('/user/cart');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const getCartCount = async () => {
  try {
    const response = await userAPI.get('/user/cart/count');
    return response.data;
  } catch (error) {
    console.error('Error getting cart count:', error);
    throw error;
  }
};

// ========== TEST FUNCTIONS ==========
export const testCartAPI = async () => {
  try {
    const response = await userAPI.get('/user/cart/test');
    return response.data;
  } catch (error) {
    console.error('Error testing cart API:', error);
    throw error;
  }
};

// ========== ORDER FUNCTIONS ==========
export const createOrder = async (orderData) => {
  try {
    const response = await userAPI.post('/user/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const fetchActiveOrders = async () => {
  try {
    const response = await userAPI.get('/user/orders/active');
    return response.data;
  } catch (error) {
    // console.error('Error fetching active orders:', error);
    throw error;
  }
};

export const fetchOrderHistory = async (params = {}) => {
  try {
    const response = await userAPI.get('/user/orders/history', { params });
    return response.data;
  } catch (error) {
    // console.error('Error fetching order history:', error);
    throw error;
  }
};

export const fetchOrderDetails = async (orderId) => {
  try {
    const response = await userAPI.get(`/user/orders/${orderId}`);
    return response.data;
  } catch (error) {
    // console.error('Error fetching order details:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId, reason = '') => {
  try {
    const response = await userAPI.put(`/user/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    // console.error('Error cancelling order:', error);
    throw error;
  }
};

export const checkCancellationEligibility = async (orderId) => {
  try {
    const response = await userAPI.get(`/user/orders/${orderId}/can-cancel`);
    return response.data;
  } catch (error) {
    // console.error('Error checking cancellation:', error);
    throw error;
  }
};

// ✅ FIXED: Use correct endpoint path
export const createPaymentSession = async (orderId) => {
  try {
    const response = await userAPI.post('/user/payment/create-session', { 
      orderId 
    });
    return response.data;
  } catch (error) {
    // console.error('Error creating payment session:', error);
    throw error;
  }
};

export const verifyPayment = async (sessionId) => {
  try {
    const response = await userAPI.get(`/user/payment/verify/${sessionId}`);
    return response.data;
  } catch (error) {
    // console.error('Error verifying payment:', error);
    throw error;
  }
}; 
export const initiateRefund = async (orderId) => {
  try {
    const response = await userAPI.post(`/user/payment/${orderId}/refund`);
    return response.data;
  } catch (error) {
    // console.error('Error initiating refund:', error);
    throw error;
  }
};

export const checkRefundStatus = async (orderId) => {
  try {
    const response = await userAPI.get(`/user/payment/${orderId}/refund-status`);
    return response.data;
  } catch (error) {
    // console.error('Error checking refund:', error);
    throw error;
  }
};

// ========== PROFILE FUNCTIONS ==========
export const fetchUserProfile = async () => {
  try {
    const response = await userAPI.get('/user/profile');
    return response.data;
  } catch (error) {
    // console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await userAPI.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    // console.error('Error updating profile:', error);
    throw error;
  }
};

export const fetchUserStats = async () => {
  try {
    const response = await userAPI.get('/user/profile/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const fetchRecentUserOrders = async (limit = 5) => {
  try {
    const response = await userAPI.get(`/user/profile/orders?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};