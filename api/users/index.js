import { withRedis } from '../_redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await withRedis(async (redis) => {
      if (req.method === 'GET') {
        const { _page = '1', _limit = '20', q = '', _sort, _order = 'asc' } = req.query;

        const usersJSON = await redis.get('users');
        let users = usersJSON ? JSON.parse(usersJSON) : [];

        if (q) {
          const searchTerm = q.toLowerCase();
          users = users.filter(user =>
            (user.name && user.name.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm)) ||
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.company?.name && user.company.name.toLowerCase().includes(searchTerm))
          );
        }

        if (_sort) {
          users.sort((a, b) => {
            const aVal = a[_sort] || '';
            const bVal = b[_sort] || '';
            const comparison = aVal.toString().localeCompare(bVal.toString());
            return _order === 'desc' ? -comparison : comparison;
          });
        }

        const page = parseInt(_page);
        const limit = parseInt(_limit);
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedUsers = users.slice(start, end);

        res.setHeader('X-Total-Count', users.length.toString());
        res.status(200).json(paginatedUsers);
        return;
      }

      if (req.method === 'POST') {
        const newUser = req.body;
        const usersJSON = await redis.get('users');
        const users = usersJSON ? JSON.parse(usersJSON) : [];

        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        newUser.id = newId;

        users.push(newUser);
        await redis.set('users', JSON.stringify(users));

        res.status(201).json(newUser);
        return;
      }

      res.status(405).json({ error: 'Method not allowed' });
    });
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
