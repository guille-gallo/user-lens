import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

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

  const redis = createClient({
    url: process.env.REDIS_URL
  });
  await redis.connect();

  try {
    // Path to the db.json file
    const dbPath = path.resolve(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf-8');
    const { users } = JSON.parse(dbData);

    if (!users) {
      return res.status(400).json({ error: 'No users found in db.json' });
    }

    // Set the data in Redis
    await redis.set('users', JSON.stringify(users));

    res.status(200).json({ message: `Successfully seeded ${users.length} users to Redis.` });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
    await redis.quit();
  }
}
