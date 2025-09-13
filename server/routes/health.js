import express from 'express';
import redisConnection from '../config/redis.js';

const router = express.Router();

// GET /api/health - Basic health check
// GET /api/health?check=full - Extended health check with Redis
router.get('/', async (req, res) => {
  try {
    const { check = 'basic' } = req.query;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        redis_url_configured: !!process.env.REDIS_URL,
        using_memory_fallback: redisConnection.isUsingMemoryFallback(),
        vercel_env: process.env.VERCEL_ENV || 'development'
      },
      endpoints: {
        users: '/api/users',
        user_by_id: '/api/users/:id',
        notifications: '/api/notifications',
        seed: '/api/seed',
        health: '/api/health'
      }
    };

    // Extended health check with Redis test
    if (check === 'full' && process.env.REDIS_URL) {
      try {
        const redis = await redisConnection.connect();
        
        // Test Redis connectivity
        const testKey = 'health_check_test';
        const testValue = Date.now().toString();
        
        await redis.set(testKey, testValue, { EX: 10 }); // Expire in 10 seconds
        const retrievedValue = await redis.get(testKey);
        
        healthData.redis = {
          status: 'connected',
          test_passed: retrievedValue === testValue,
          connection_time: new Date().toISOString()
        };
      } catch (redisError) {
        healthData.redis = {
          status: 'error',
          error: redisError.message,
          connection_time: new Date().toISOString()
        };
      }
    } else if (check === 'full') {
      healthData.redis = {
        status: 'not_configured',
        message: 'Redis URL not provided'
      };
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
});

export default router;
