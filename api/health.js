export default function handler(req, res) {
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

  try {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        redis_url_configured: !!process.env.REDIS_URL,
        vercel_env: process.env.VERCEL_ENV || 'unknown'
      },
      endpoints: {
        users: '/api/users',
        user_by_id: '/api/users/[id]',
        notifications: '/api/notifications',
        seed: '/api/seed',
        test_redis: '/api/test-redis',
        health: '/api/health'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
