const { createClient } = require('redis');
const path = require('path');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const redis = createClient({
    url: process.env.REDIS_URL
  });
  await redis.connect();

  try {
    if (req.method === 'GET') {
      // Get query parameters
      const { _page = '1', _limit = '20', q = '', _sort, _order = 'asc' } = req.query;
      
      const usersJSON = await redis.get('users');
      let users = usersJSON ? JSON.parse(usersJSON) : [];

      // Handle search
      if (q) {
        users = users.filter(user => 
          user.name.toLowerCase().includes(q.toLowerCase()) ||
          user.email.toLowerCase().includes(q.toLowerCase()) ||
          user.username.toLowerCase().includes(q.toLowerCase()) ||
          (user.company?.name && user.company.name.toLowerCase().includes(q.toLowerCase()))
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await redis.quit();
  }
};
