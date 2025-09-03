const fs = require('fs');
const path = require('path');

// Load the database once
let db;
try {
  const dbPath = path.join(__dirname, '../db.json');
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(dbContent);
} catch (error) {
  console.error('Failed to load database:', error);
  db = { users: [] };
}

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Handle /api/users endpoint
    if (pathname === '/api/users' && req.method === 'GET') {
      let users = [...db.users];

      // Handle search
      const query = searchParams.get('q');
      if (query) {
        users = users.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          (user.company?.name && user.company.name.toLowerCase().includes(query.toLowerCase()))
        );
      }

      // Handle sorting
      const sortField = searchParams.get('_sort');
      const sortOrder = searchParams.get('_order') || 'asc';
      if (sortField) {
        users.sort((a, b) => {
          const aVal = a[sortField] || '';
          const bVal = b[sortField] || '';
          const comparison = aVal.toString().localeCompare(bVal.toString());
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Handle pagination
      const page = parseInt(searchParams.get('_page')) || 1;
      const limit = parseInt(searchParams.get('_limit')) || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = users.slice(start, end);

      res.status(200).json(paginatedUsers);
      return;
    }

    // Handle single user by ID
    const userIdMatch = pathname.match(/^\/api\/users\/(\d+)$/);
    if (userIdMatch && req.method === 'GET') {
      const userId = parseInt(userIdMatch[1]);
      const user = db.users.find(u => u.id === userId);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
      return;
    }

    // Default response for unhandled routes
    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
