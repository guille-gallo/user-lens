import { createClient } from 'redis';

export async function withRedis(work) {
  const redisUrl = process.env.KV_URL || process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('Redis URL not configured');
  }

  const client = createClient({
    url: redisUrl,
    socket: {
      tls: redisUrl.startsWith('rediss://'),
      connectTimeout: 5000,
      reconnectStrategy: false,
    },
  });

  try {
    await client.connect();
    return await work(client);
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}
