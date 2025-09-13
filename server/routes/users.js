import express from 'express';
import redisConnection from '../config/redis.js';

const router = express.Router();

// GET /api/users - Get all users with pagination, search, and sorting
router.get('/', async (req, res) => {
  try {
    const redis = await redisConnection.connect();
    
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
    
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / limit);

    // Return structured response matching frontend expectations
    const response = {
      data: paginatedUsers,
      pagination: {
        page: page,
        limit: limit,
        total: totalUsers,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    res.setHeader('X-Total-Count', totalUsers.toString());
    res.status(200).json(response);
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const redis = await redisConnection.connect();
    const newUser = req.body;
    
    const usersJSON = await redis.get('users');
    let users = usersJSON ? JSON.parse(usersJSON) : [];
    
    // Assign a new ID
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    newUser.id = newId;
    
    users.push(newUser);
    await redis.set('users', JSON.stringify(users));
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

// GET /api/users/:id - Get a specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const redis = await redisConnection.connect();
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const usersJSON = await redis.get('users');
    let users = usersJSON ? JSON.parse(usersJSON) : [];

    const user = users.find(u => u.id === userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

// PUT /api/users/:id - Update a specific user
router.put('/:id', async (req, res) => {
  try {
    const redis = await redisConnection.connect();
    const userId = parseInt(req.params.id);
    const updatedUser = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const usersJSON = await redis.get('users');
    let users = usersJSON ? JSON.parse(usersJSON) : [];

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      // Preserve the ID
      updatedUser.id = userId;
      users[userIndex] = updatedUser;
      await redis.set('users', JSON.stringify(users));
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

// DELETE /api/users/:id - Delete a specific user
router.delete('/:id', async (req, res) => {
  try {
    const redis = await redisConnection.connect();
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const usersJSON = await redis.get('users');
    let users = usersJSON ? JSON.parse(usersJSON) : [];

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const deletedUser = users.splice(userIndex, 1)[0];
      await redis.set('users', JSON.stringify(users));
      res.status(200).json({ 
        message: 'User deleted successfully', 
        user: deletedUser 
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

export default router;
