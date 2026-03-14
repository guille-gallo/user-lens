import { createClient } from 'redis';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if Redis URL is configured
  const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
  if (!redisUrl) {
    return res.status(500).json({ error: 'Redis URL not configured' });
  }

  const redis = createClient({
    url: redisUrl,
    socket: {
      tls: redisUrl.startsWith('rediss://'),
      connectTimeout: 5000,
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });

  const { id } = req.query;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    await redis.connect();
    
    const usersJSON = await redis.get('users');
    let users = usersJSON ? JSON.parse(usersJSON) : [];

    if (req.method === 'GET') {
      const user = users.find(u => u.id === userId);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else if (req.method === 'PUT') {
      const updatedUser = req.body;
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        await redis.set('users', JSON.stringify(users));
        res.status(200).json(users[userIndex]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else if (req.method === 'DELETE') {
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        await redis.set('users', JSON.stringify(users));
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
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
