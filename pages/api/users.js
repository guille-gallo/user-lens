import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Read the db.json file
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    if (req.method === 'GET') {
      let users = dbData.users;
      
      // Handle query parameters
      const { _limit, _page, q } = req.query;
      
      // Search functionality
      if (q) {
        users = users.filter(user => 
          user.name.toLowerCase().includes(q.toLowerCase()) ||
          user.email.toLowerCase().includes(q.toLowerCase()) ||
          user.company.name.toLowerCase().includes(q.toLowerCase())
        );
      }
      
      // Pagination
      if (_limit) {
        const limit = parseInt(_limit);
        const page = parseInt(_page) || 1;
        const start = (page - 1) * limit;
        users = users.slice(start, start + limit);
      }
      
      res.status(200).json(users);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
