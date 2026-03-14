import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

// Faker import - will be used if available
let faker = null;
try {
  const fakerModule = await import('@faker-js/faker');
  faker = fakerModule.faker;
} catch (err) {
  console.log('Faker not available, using fallback data generation');
}

// Generate users function using faker if available, otherwise simple generation
const generateUsers = (count) => {
  const users = [];
  
  if (faker) {
    // Use faker for realistic data
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
  } else {
    // Fallback simple generation
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
    const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
    redis = createClient({
      url: redisUrl
    });
    
    redis.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await redis.connect();
    
    // Get parameters
    const { force = 'false', count, seed, source = 'auto' } = req.query;
    
    // Check if data already exists
    const existingUsers = await redis.get('users');
    const existingCount = existingUsers ? JSON.parse(existingUsers).length : 0;
    
    if (existingCount > 0 && force !== 'true') {
      return res.status(200).json({ 
        message: 'Database already seeded',
        user_count: existingCount,
        note: 'Use ?force=true to re-seed, ?count=N for custom count, ?source=generate to force generation'
      });
    }

    let users = [];
    let dataSource = 'unknown';
    
    // Strategy 1: Try to load from db.json if no specific source requested
    if (source === 'auto' || source === 'file') {
      try {
        const dbPath = path.join(process.cwd(), 'db.json');
        if (fs.existsSync(dbPath)) {
          const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
          users = dbData.users || [];
          dataSource = 'db.json file';
          console.log(`Loaded ${users.length} users from db.json`);
        }
      } catch (fileError) {
        console.log('Could not load db.json:', fileError.message);
      }
    }

    // Strategy 2: Generate data if no file data or if specifically requested
    if (users.length === 0 || source === 'generate') {
      const userCount = count ? Math.min(parseInt(count), 10000) : 10000;
      
      // Set seed for reproducible data if provided
      if (seed && faker) {
        faker.seed(parseInt(seed));
      }
      
      console.log(`Generating ${userCount} users...`);
      const startTime = Date.now();
      
      users = generateUsers(userCount);
      
      const generationTime = Date.now() - startTime;
      dataSource = faker ? 'faker.js generated' : 'simple generated';
      console.log(`Generated ${users.length} users in ${generationTime}ms using ${dataSource}`);
    }

    // Strategy 3: Fallback sample data
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
            "geo": { "lat": 89.7261, "lng": -153.925 }
          },
          "phone": "1-826-364-9052 x31711",
          "website": "adolescent-lobster.org",
          "company": {
            "name": "Shields LLC",
            "catchPhrase": "Cross-platform tangible array",
            "bs": "engage scalable infrastructures"
          }
        }
      ];
      dataSource = 'fallback sample data';
    }

    // Seed the database
    console.log(`Seeding Redis with ${users.length} users`);
    const seedStartTime = Date.now();
    await redis.set('users', JSON.stringify(users));
    const seedTime = Date.now() - seedStartTime;
    
    res.status(200).json({ 
      message: `Database seeded successfully with ${users.length} users`,
      user_count: users.length,
      data_source: dataSource,
      faker_available: !!faker,
      performance: {
        redis_seed_time_ms: seedTime
      },
      sample_user: users[0],
      available_params: {
        force: 'true/false - Force re-seed',
        count: 'N - Number of users to generate (max 10000)',
        seed: 'N - Seed for reproducible data',
        source: 'auto/file/generate - Data source strategy'
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ 
      error: 'Failed to seed database', 
      details: error.message,
      redis_url_exists: !!(process.env.KV_URL || process.env.REDIS_URL)
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
