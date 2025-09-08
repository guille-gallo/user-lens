import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Allow CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let redis;
  try {
    redis = createClient({
      url: process.env.REDIS_URL
    });
    
    redis.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await redis.connect();
    
    // Check if data already exists
    const existingUsers = await redis.get('users');
    const existingCount = existingUsers ? JSON.parse(existingUsers).length : 0;
    
    // Get force parameter to allow re-seeding
    const { force = 'false' } = req.query;
    
    if (existingCount > 0 && force !== 'true') {
      return res.status(200).json({ 
        message: 'Database already seeded',
        user_count: existingCount,
        note: 'Use ?force=true to re-seed with fresh data'
      });
    }

    // Try to load data from the existing db.json file
    let users = [];
    
    try {
      // Try to read the db.json file that should be in the project root
      const dbPath = path.join(process.cwd(), 'db.json');
      if (fs.existsSync(dbPath)) {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        users = dbData.users || [];
        console.log(`Loaded ${users.length} users from db.json`);
      }
    } catch (fileError) {
      console.log('Could not load db.json, using fallback data:', fileError.message);
    }

    // If no users loaded from file, use fallback sample data
    if (users.length === 0) {
      users = [
        {
          "id": 1,
          "name": "Jon Marquardt III",
          "username": "Benjamin_Olson84",
          "email": "Dorthy39@gmail.com",
          "address": {
            "street": "9588 Cortez Wells",
            "suite": "Suite 245",
            "city": "North Joeboro",
            "zipcode": "66761-3353",
            "geo": {
              "lat": 89.7261,
              "lng": -153.925
            }
          },
          "phone": "1-826-364-9052 x31711",
          "website": "adolescent-lobster.org",
          "company": {
            "name": "Shields LLC",
            "catchPhrase": "Cross-platform tangible array",
            "bs": "engage scalable infrastructures"
          }
        },
        {
          "id": 2,
          "name": "Alice Johnson",
          "username": "alice_j",
          "email": "alice.johnson@example.com",
          "address": {
            "street": "123 Main St",
            "suite": "Apt 4B",
            "city": "Springfield",
            "zipcode": "12345",
            "geo": {
              "lat": 40.7128,
              "lng": -74.0060
            }
          },
          "phone": "555-0123",
          "website": "alice-designs.com",
          "company": {
            "name": "Creative Solutions Inc",
            "catchPhrase": "Innovative design solutions",
            "bs": "revolutionize user experiences"
          }
        },
        {
          "id": 3,
          "name": "Bob Smith",
          "username": "bobsmith",
          "email": "bob.smith@company.com",
          "address": {
            "street": "456 Oak Avenue",
            "suite": "Suite 100",
            "city": "Riverside",
            "zipcode": "67890",
            "geo": {
              "lat": 34.0522,
              "lng": -118.2437
            }
          },
          "phone": "555-0456",
          "website": "bobtech.net",
          "company": {
            "name": "Tech Innovations Ltd",
            "catchPhrase": "Technology for tomorrow",
            "bs": "streamline digital workflows"
          }
        }
      ];
    }

    // Seed the database
    console.log(`Seeding Redis with ${users.length} users`);
    await redis.set('users', JSON.stringify(users));
    
    res.status(200).json({ 
      message: 'Database seeded successfully',
      user_count: users.length,
      data_source: users.length > 3 ? 'db.json file' : 'fallback sample data',
      sample_user: users[0]
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ 
      error: 'Failed to seed database', 
      details: error.message,
      redis_url_exists: !!process.env.REDIS_URL
    });
  } finally {
    try {
      if (redis && redis.isReady) {
        await redis.disconnect();
      }
    } catch (quitError) {
      console.error('Redis disconnect error:', quitError);
    }
  }
};
