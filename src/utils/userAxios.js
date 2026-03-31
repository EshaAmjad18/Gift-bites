// src/utils/userAxios.js
import axios from 'axios';
import { authHelperUser } from './authHelper';

const userAPI = axios.create({
  baseURL: 'https://gift-bites-production.up.railway.app/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
userAPI.interceptors.request.use(config => {
  const token = authHelperUser.getUserToken();
  console.log('🔑 Token in request interceptor:', token); // Debug line
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No token found!');
  }
  return config;
});


// handle 401
userAPI.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
     console.log('🔒 401 Unauthorized, clearing auth...');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default userAPI;
