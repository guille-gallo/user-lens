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

  // Check if Redis URL is configured
  const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
  if (!redisUrl) {
    return res.status(500).json({ error: 'Redis URL not configured' });
  }

  let redis;
  try {
    redis = createClient({
      url: redisUrl
    });
    
    redis.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await redis.connect();

    if (req.method === 'GET') {
      // Get query parameters
      const { _page = '1', _limit = '20', q = '', _sort, _order = 'asc' } = req.query;
      
      const usersJSON = await redis.get('users');
      let users = usersJSON ? JSON.parse(usersJSON) : [];

      // Handle search
      if (q) {
        const searchTerm = q.toLowerCase();
        users = users.filter(user => 
          (user.name && user.name.toLowerCase().includes(searchTerm)) ||
          (user.email && user.email.toLowerCase().includes(searchTerm)) ||
          (user.username && user.username.toLowerCase().includes(searchTerm)) ||
          (user.company?.name && user.company.name.toLowerCase().includes(searchTerm))
        );
      }

      // Handle sorting
      if (_sort) {
        users.sort((a, b) => {
          const aVal = a[_sort] || '';
          const bVal = b[_sort] || '';
          const comparison = aVal.toString().localeCompare(bVal.toString());
          return _order === 'desc' ? -comparison : comparison;
        });
      }

      // Handle pagination
      const page = parseInt(_page);
      const limit = parseInt(_limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = users.slice(start, end);

      res.setHeader('X-Total-Count', users.length.toString());
      res.status(200).json(paginatedUsers);
    } else if (req.method === 'POST') {
      const newUser = req.body;
      const usersJSON = await redis.get('users');
      let users = usersJSON ? JSON.parse(usersJSON) : [];
      
      // Assign a new ID
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      newUser.id = newId;
      
      users.push(newUser);
      await redis.set('users', JSON.stringify(users));
      
      res.status(201).json(newUser);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
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
