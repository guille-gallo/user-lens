import { createClient } from 'redis';

// Generate users function (copied from scripts/generate-data.js but adapted for serverless)
const generateUsers = (count) => {
  // Simple deterministic fake data generation (without faker dependency for now)
  const users = [];
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Frank', 'Grace', 'Henry', 'Isabel'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const companies = ['Tech Corp', 'Innovation Inc', 'Digital Solutions', 'Smart Systems', 'Future Tech', 'Cloud Nine', 'Data Dynamics', 'Web Works', 'Code Craft', 'Pixel Perfect'];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[(i * 3) % lastNames.length];
    const city = cities[(i * 7) % cities.length];
    const company = companies[(i * 11) % companies.length];
    
    const user = {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      address: {
        street: `${100 + (i * 17) % 9000} Main St`,
        suite: `Suite ${(i * 13) % 500}`,
        city: city,
        zipcode: `${10000 + (i * 19) % 89999}`,
        geo: {
          lat: (Math.sin(i) * 90).toFixed(4),
          lng: (Math.cos(i) * 180).toFixed(4),
        },
      },
      phone: `555-${String(i).padStart(4, '0')}`,
      website: `${firstName.toLowerCase()}-${lastName.toLowerCase()}.com`,
      company: {
        name: company,
        catchPhrase: `Quality ${firstName} solutions`,
        bs: `optimize ${lastName.toLowerCase()} systems`,
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
    const { count = '10000', force = 'false' } = req.query;
    const userCount = Math.min(parseInt(count), 10000); // Limit to 10K for safety
    
    // Check if data already exists
    const existingUsers = await redis.get('users');
    const existingCount = existingUsers ? JSON.parse(existingUsers).length : 0;
    
    if (existingCount > 0 && force !== 'true') {
      return res.status(200).json({ 
        message: 'Database already seeded',
        user_count: existingCount,
        note: 'Use ?force=true to re-seed or ?count=N to specify number of users'
      });
    }

    console.log(`Generating ${userCount} users...`);
    const users = generateUsers(userCount);
    
    console.log(`Seeding Redis with ${users.length} users...`);
    await redis.set('users', JSON.stringify(users));
    
    res.status(200).json({ 
      message: `Database seeded successfully with ${users.length} users`,
      user_count: users.length,
      data_source: 'dynamically generated',
      sample_user: users[0],
      note: `Generated ${users.length} users with deterministic fake data`
    });
  } catch (error) {
    console.error('Bulk seeding error:', error);
    res.status(500).json({ 
      error: 'Failed to bulk seed database', 
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
