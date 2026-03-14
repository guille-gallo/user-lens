import { Redis } from '@upstash/redis';

function createRedisFromUpstashUrl(redisUrl) {
  const parsed = new URL(redisUrl);
  const token = decodeURIComponent(parsed.password || '');

  if (!token || !parsed.hostname) {
    throw new Error('Invalid Upstash REDIS_URL');
  }

  return new Redis({
    url: `https://${parsed.hostname}`,
    token,
  });
}

export function getRedis() {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (restUrl && restToken) {
    return new Redis({ url: restUrl, token: restToken });
  }

  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    throw new Error('Redis URL not configured');
  }

  if (redisUrl.startsWith('rediss://') && redisUrl.includes('.upstash.io')) {
    return createRedisFromUpstashUrl(redisUrl);
  }

  throw new Error('Unsupported Redis configuration for serverless runtime');
}
