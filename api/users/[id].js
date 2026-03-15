import { withRedis } from '../_redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
  if (!redisUrl) {
    return res.status(500).json({ error: 'Redis URL not configured' });
  }

  try {
    await withRedis(async (redis) => {
      const { id } = req.query;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const usersJSON = await redis.get('users');
      const users = usersJSON ? JSON.parse(usersJSON) : [];

      if (req.method === 'GET') {
        const user = users.find(u => u.id === userId);
        if (user) res.status(200).json(user);
        else res.status(404).json({ error: 'User not found' });
        return;
      }

      if (req.method === 'PUT') {
        const updatedUser = req.body;
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updatedUser };
          await redis.set('users', JSON.stringify(users));
          res.status(200).json(users[userIndex]);
        } else {
          res.status(404).json({ error: 'User not found' });
        }
        return;
      }

      if (req.method === 'DELETE') {
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
          users.splice(userIndex, 1);
          await redis.set('users', JSON.stringify(users));
          res.status(204).end();
        } else {
          res.status(404).json({ error: 'User not found' });
        }
        return;
      }

      res.status(405).json({ error: 'Method not allowed' });
    });
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
