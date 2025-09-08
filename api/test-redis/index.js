import { createClient } from 'redis';

export default async function handler(req, res) {
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

  // Check if Redis URL is configured
  if (!process.env.REDIS_URL) {
    return res.status(500).json({ 
      error: 'Redis URL not configured',
      redis_url_exists: false
    });
  }

  const redis = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: process.env.REDIS_URL?.includes('rediss://'),
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });

  try {
    // Test Redis connection
    await redis.connect();
    
    // Simple test operations
    const testKey = `test_${Date.now()}`;
    await redis.set(testKey, 'hello_world');
    const result = await redis.get(testKey);
    await redis.del(testKey); // Clean up
    
    // Check if users data exists
    const usersData = await redis.get('users');
    const userCount = usersData ? JSON.parse(usersData).length : 0;
    
    res.status(200).json({ 
      message: 'Redis connection test successful', 
      test_result: result,
      redis_url_exists: true,
      users_in_db: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({ 
      error: 'Redis connection failed', 
      details: error.message,
      redis_url_exists: !!process.env.REDIS_URL,
      timestamp: new Date().toISOString()
    });
  } finally {
    try {
      if (redis.isOpen) {
        await redis.quit();
      }
    } catch (quitError) {
      console.error('Redis quit error:', quitError);
    }
  }
};
