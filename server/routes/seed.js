import express from 'express';
import redisConnection from '../config/redis.js';

const router = express.Router();

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

// POST /api/seed - Seed the database with sample users
router.post('/', async (req, res) => {
  try {
    const redis = await redisConnection.connect();
    
    const { count = 50, reset = false } = req.body;
    const userCount = Math.min(parseInt(count) || 50, 1000); // Limit to 1000 users max

    let users = [];
    
    if (!reset) {
      // Get existing users
      const existingUsersJSON = await redis.get('users');
      users = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];
    }

    // Generate new users
    const newUsers = generateUsers(userCount);
    
    if (reset || users.length === 0) {
      users = newUsers;
    } else {
      // Append new users with proper IDs
      const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
      newUsers.forEach((user, index) => {
        user.id = maxId + index + 1;
        users.push(user);
      });
    }

    // Save to Redis
    await redis.set('users', JSON.stringify(users));

    res.status(200).json({
      message: `Successfully ${reset ? 'seeded' : 'added'} ${userCount} users`,
      total_users: users.length,
      action: reset ? 'reset_and_seed' : 'append',
      faker_available: !!faker,
      generated_users: userCount
    });
  } catch (error) {
    console.error('Seed operation error:', error);
    res.status(500).json({
      error: 'Failed to seed database',
      details: error.message
    });
  }
});

// GET /api/seed - Get seed status and information
router.get('/', async (req, res) => {
  try {
    const redis = await redisConnection.connect();
    
    const usersJSON = await redis.get('users');
    const users = usersJSON ? JSON.parse(usersJSON) : [];

    res.status(200).json({
      current_users: users.length,
      faker_available: !!faker,
      last_seeded: users.length > 0 ? 'Data exists' : 'No data',
      seed_endpoint: {
        method: 'POST',
        body: {
          count: 'number (default: 50, max: 1000)',
          reset: 'boolean (default: false)'
        }
      }
    });
  } catch (error) {
    console.error('Seed status error:', error);
    res.status(500).json({
      error: 'Failed to get seed status',
      details: error.message
    });
  }
});

export default router;
