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

  const redis = createClient({
    url: process.env.REDIS_URL
  });

  try {
    await redis.connect();
    
    // Check if data already exists
    const existingUsers = await redis.get('users');
    if (existingUsers && req.method === 'GET') {
      const users = JSON.parse(existingUsers);
      return res.status(200).json({ 
        message: 'Database already seeded',
        user_count: users.length,
        sample_user: users[0] || null
      });
    }

    // Sample data for seeding
    const sampleUsers = [
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

    // Seed the database
    await redis.set('users', JSON.stringify(sampleUsers));
    
    res.status(200).json({ 
      message: 'Database seeded successfully',
      user_count: sampleUsers.length,
      sample_user: sampleUsers[0]
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
      await redis.quit();
    } catch (quitError) {
      console.error('Redis quit error:', quitError);
    }
  }
};
