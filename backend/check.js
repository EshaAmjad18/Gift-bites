// backend/testAllAuth.js
const axios = require('axios');

const testAllAuth = async () => {
  const baseURL = 'http://localhost:5000';
  
  const testCases = [
    {
      name: 'User Login',
      method: 'POST',
      endpoint: '/api/user/auth/login',
      data: { email: '231370057@gift.edu.pk', password: '231370057' }
    },
    {
      name: 'Staff Login',
      method: 'POST', 
      endpoint: '/api/staff/auth/login',
      data: { email: 'basement_staff@gmail.com', password: 'Basement@123' }
    },
    {
      name: 'Admin Login',
      method: 'POST',
      endpoint: '/api/admin/auth/login',
      data: { email: 'admin@gmail.com', password: 'Admin@123' }
    },
    {
      name: 'User Test',
      method: 'GET',
      endpoint: '/api/user/auth/test',
      data: null
    },
    {
      name: 'Staff Test',
      method: 'GET',
      endpoint: '/api/staff/auth/test',
      data: null
    },
    {
      name: 'Admin Test',
      method: 'GET',
      endpoint: '/api/admin/auth/test',
      data: null
    }
  ];

  console.log('🧪 Testing All Authentication APIs...\n');

  for (const test of testCases) {
    try {
      console.log(`🔍 ${test.name}:`);
      console.log(`   ${test.method} ${test.endpoint}`);
      
      let response;
      if (test.method === 'GET') {
        response = await axios.get(baseURL + test.endpoint);
      } else {
        response = await axios.post(baseURL + test.endpoint, test.data);
      }
      
      console.log(`   Success: ${response.status}`);
      console.log(`   Message: ${response.data.message || 'OK'}`);
      
      if (response.data.success === false) {
        console.log(`   Error: ${response.data.message}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   Failed: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data)}`);
      }
      console.log('');
    }
  }
};

testAllAuth();