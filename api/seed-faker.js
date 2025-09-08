import { createClient } from 'redis';
import { faker } from '@faker-js/faker';

// Generate users function using faker (same as scripts/generate-data.js)
const generateUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = {
      id: i + 1,
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      address: {
        street: faker.location.streetAddress(),
        suite: faker.location.secondaryAddress(),
        city: faker.location.city(),
        zipcode: faker.location.zipCode(),
        geo: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        },
      },
      phone: faker.phone.number(),
      website: faker.internet.domainName(),
      company: {
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        bs: faker.company.buzzPhrase(),
      },
    };
    users.push(user);
  }
  return users;
};

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
    
    // Get parameters
    const { count = '10000', force = 'false', seed } = req.query;
    const userCount = Math.min(parseInt(count), 10000); // Limit to 10K for safety
    
    // Set seed for reproducible data if provided
    if (seed) {
      faker.seed(parseInt(seed));
    }
    
    // Check if data already exists
    const existingUsers = await redis.get('users');
    const existingCount = existingUsers ? JSON.parse(existingUsers).length : 0;
    
    if (existingCount > 0 && force !== 'true') {
      return res.status(200).json({ 
        message: 'Database already seeded',
        user_count: existingCount,
        note: 'Use ?force=true to re-seed, ?count=N for user count, ?seed=N for reproducible data'
      });
    }

    console.log(`Generating ${userCount} users with faker...`);
    const startTime = Date.now();
    
    const users = generateUsers(userCount);
    
    const generationTime = Date.now() - startTime;
    console.log(`Generated ${users.length} users in ${generationTime}ms`);
    
    console.log(`Seeding Redis with ${users.length} users...`);
    const seedStartTime = Date.now();
    await redis.set('users', JSON.stringify(users));
    const seedTime = Date.now() - seedStartTime;
    
    res.status(200).json({ 
      message: `Database seeded successfully with ${users.length} realistic users`,
      user_count: users.length,
      data_source: 'faker.js generated',
      performance: {
        generation_time_ms: generationTime,
        redis_seed_time_ms: seedTime,
        total_time_ms: generationTime + seedTime
      },
      sample_user: users[0],
      note: `Generated ${users.length} users with realistic fake data using faker.js`
    });
  } catch (error) {
    console.error('Faker seed error:', error);
    res.status(500).json({ 
      error: 'Failed to seed database with faker data', 
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
}
