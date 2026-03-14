import { getRedis } from './_redis.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { check = 'basic' } = req.query;
  
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        redis_url_configured: !!(process.env.KV_URL || process.env.REDIS_URL),
        kv_url_exists: !!process.env.KV_URL,
        kv_url_prefix: process.env.KV_URL ? process.env.KV_URL.substring(0, 12) : null,
        kv_rest_api_url_exists: !!process.env.KV_REST_API_URL,
        redis_url_exists: !!process.env.REDIS_URL,
        redis_url_prefix: process.env.REDIS_URL ? process.env.REDIS_URL.substring(0, 12) : null,
        vercel_env: process.env.VERCEL_ENV || 'unknown'
      },
      endpoints: {
        users: '/api/users',
        user_by_id: '/api/users/[id]',
        notifications: '/api/notifications',
        seed: '/api/seed',
        health: '/api/health'
      }
    };

    // Extended health check with Redis test
    const redisConfigured = !!(process.env.KV_URL || process.env.REDIS_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL);
    if (check === 'full' && redisConfigured) {
      try {
        const redis = getRedis();
        
        // Test Redis operations
        const testKey = `health_test_${Date.now()}`;
        await redis.set(testKey, 'health_check');
        const testResult = await redis.get(testKey);
        await redis.del(testKey);
        
        // Check users count
        const usersData = await redis.get('users');
        const userCount = usersData ? JSON.parse(usersData).length : 0;
        
        healthData.redis = {
          status: 'connected',
          test_result: testResult,
          users_in_db: userCount,
          connection_time_ms: Date.now() - new Date(healthData.timestamp).getTime()
        };
        
      } catch (redisError) {
        healthData.redis = {
          status: 'error',
          error: redisError.message
        };
      }
    }

    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
