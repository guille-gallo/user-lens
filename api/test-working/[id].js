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

  const redis = createClient({
    url: process.env.REDIS_URL
  });
  await redis.connect();

  const { id } = req.query;
  const userId = parseInt(id);

  try {
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await redis.quit();
  }
};
