import { withRedis } from '../_redis.js';
import fs from 'fs';
import path from 'path';

let faker = null;
try {
  const fakerModule = await import('@faker-js/faker');
  faker = fakerModule.faker;
} catch {
  console.log('Faker not available, using fallback data generation');
}

const generateUsers = (count) => {
  const users = [];

  if (faker) {
    for (let i = 0; i < count; i++) {
      users.push({
        id: i + 1,
        name: faker.person.fullName(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        address: {
          street: faker.location.streetAddress(),
          suite: faker.location.secondaryAddress(),
          city: faker.location.city(),
          zipcode: faker.location.zipCode(),
          geo: { lat: faker.location.latitude(), lng: faker.location.longitude() },
        },
        phone: faker.phone.number(),
        website: faker.internet.domainName(),
        company: {
          name: faker.company.name(),
          catchPhrase: faker.company.catchPhrase(),
          bs: faker.company.buzzPhrase(),
        },
      });
    }
  } else {
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Frank', 'Grace', 'Henry', 'Isabel'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const companies = ['Tech Corp', 'Innovation Inc', 'Digital Solutions', 'Smart Systems', 'Future Tech', 'Cloud Nine', 'Data Dynamics', 'Web Works', 'Code Craft', 'Pixel Perfect'];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[(i * 3) % lastNames.length];
      const city = cities[(i * 7) % cities.length];
      const company = companies[(i * 11) % companies.length];

      users.push({
        id: i + 1,
        name: `${firstName} ${lastName}`,
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        address: {
          street: `${100 + (i * 17) % 9000} Main St`,
          suite: `Suite ${(i * 13) % 500}`,
          city,
          zipcode: `${10000 + (i * 19) % 89999}`,
          geo: { lat: (Math.sin(i) * 90).toFixed(4), lng: (Math.cos(i) * 180).toFixed(4) },
        },
        phone: `555-${String(i).padStart(4, '0')}`,
        website: `${firstName.toLowerCase()}-${lastName.toLowerCase()}.com`,
        company: {
          name: company,
          catchPhrase: `Quality ${firstName} solutions`,
          bs: `optimize ${lastName.toLowerCase()} systems`,
        },
      });
    }
  }

  return users;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await withRedis(async (redis) => {
      const { force = 'false', count, seed, source = 'auto' } = req.query;

      const existingUsers = await redis.get('users');
      const existingCount = existingUsers ? JSON.parse(existingUsers).length : 0;

      if (existingCount > 0 && force !== 'true') {
        res.status(200).json({
          message: 'Database already seeded',
          user_count: existingCount,
          note: 'Use ?force=true to re-seed, ?count=N for custom count, ?source=generate to force generation'
        });
        return;
      }

      let users = [];
      let dataSource = 'unknown';

      if (source === 'auto' || source === 'file') {
        try {
          const dbPath = path.join(process.cwd(), 'db.json');
          if (fs.existsSync(dbPath)) {
            const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            users = dbData.users || [];
            dataSource = 'db.json file';
          }
        } catch (fileError) {
          console.log('Could not load db.json:', fileError.message);
        }
      }

      if (users.length === 0 || source === 'generate') {
        const userCount = count ? Math.min(parseInt(count), 10000) : 10000;
        if (seed && faker) faker.seed(parseInt(seed));
        users = generateUsers(userCount);
        dataSource = faker ? 'faker.js generated' : 'simple generated';
      }

      if (users.length === 0) {
        users = [{ id: 1, name: 'Jon Marquardt III', username: 'Benjamin_Olson84', email: 'Dorthy39@gmail.com' }];
        dataSource = 'fallback sample data';
      }

      const seedStartTime = Date.now();
      await redis.set('users', JSON.stringify(users));
      const seedTime = Date.now() - seedStartTime;

      res.status(200).json({
        message: `Database seeded successfully with ${users.length} users`,
        user_count: users.length,
        data_source: dataSource,
        faker_available: !!faker,
        performance: { redis_seed_time_ms: seedTime },
        sample_user: users[0],
      });
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Failed to seed database', details: error.message, redis_url_exists: !!(process.env.KV_URL || process.env.REDIS_URL) });
  }
}
