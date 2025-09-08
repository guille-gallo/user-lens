import { createClient } from '@vercel/kv';
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

  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  try {
    // Path to the db.json file
    const dbPath = path.resolve(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf-8');
    const { users } = JSON.parse(dbData);

    if (!users) {
      return res.status(400).json({ error: 'No users found in db.json' });
    }

    // Set the data in Vercel KV
    await kv.set('users', users);

    res.status(200).json({ message: `Successfully seeded ${users.length} users to Vercel KV.` });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
