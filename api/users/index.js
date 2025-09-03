import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Path to the db.json file
    const dbPath = path.resolve(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf-8');
    const { users: allUsers } = JSON.parse(dbData);

    if (req.method === 'GET') {
      // Get query parameters
      const { _page = '1', _limit = '20', q = '', _sort, _order = 'asc' } = req.query;
      
      let users = [...allUsers];

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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
