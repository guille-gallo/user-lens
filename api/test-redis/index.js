const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  // Allow CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test Redis connection
    const redis = createClient({
      url: process.env.REDIS_URL
    });
    await redis.connect();
    
    // Simple test
    await redis.set('test', 'hello');
    const result = await redis.get('test');
    
    await redis.quit();
    
    res.status(200).json({ 
      message: 'Redis connection test successful', 
      test_result: result,
      redis_url_exists: !!process.env.REDIS_URL
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({ 
      error: 'Redis connection failed', 
      details: error.message,
      redis_url_exists: !!process.env.REDIS_URL
    });
  }
};
