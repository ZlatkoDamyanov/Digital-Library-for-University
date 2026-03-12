import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const API_URL = 'http://localhost:5000';
const JWT_SECRET = 'your-super-secret-jwt-key-here-change-this-in-production';

const testUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  role: 'USER'
};

const testToken = jwt.sign(testUser, JWT_SECRET);

async function testBorrowRequest() {
  try {
    console.log('🧪 Testing borrow request functionality...');
    
    const borrowData = {
      bookId: '00000000-0000-0000-0000-000000000001',
      borrowDate: new Date().toISOString().split('T')[0],
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    console.log('📖 Test data:', borrowData);
    
    const response = await fetch(`${API_URL}/api/borrow-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify(borrowData)
    });
    
    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', result);
    
    if (response.ok && result.success) {
      console.log('✅ Borrow request test PASSED!');
    } else {
      console.log('❌ Borrow request test FAILED!');
      console.log('Error details:', result.error || result.details);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

async function testServerHealth() {
  try {
    console.log('🏥 Testing server health...');
    const response = await fetch(`${API_URL}/health`);
    
    if (response.ok) {
      console.log('✅ Server is healthy');
      return true;
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to server:', error.message);
    return false;
  }
}

async function runTests() {
  const isHealthy = await testServerHealth();
  
  if (isHealthy) {
    await testBorrowRequest();
  } else {
    console.log('⚠️  Cannot run borrow request test - server is not healthy');
  }
}

runTests(); 