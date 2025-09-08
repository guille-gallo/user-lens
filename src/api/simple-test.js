const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple test endpoint
  if (req.url === '/api/test') {
    res.status(200).json({ message: 'API is working!' });
    return;
  }

  // Return a simple response for users
  if (req.url?.startsWith('/api/users')) {
    const sampleUsers = [
      {
        "id": 1,
        "name": "Jon Marquardt III",
        "username": "Benjamin_Olson84",
        "email": "Dorthy39@gmail.com",
        "phone": "1-826-364-9052 x31711",
        "website": "adolescent-lobster.org",
        "company": {
          "name": "Hodkiewicz LLC",
          "catchPhrase": "Face to face full-range emulation"
        }
      },
      {
        "id": 2,
        "name": "Elias Wolf DVM",
        "username": "Myron38",
        "email": "Jennings77@gmail.com",
        "phone": "367.856.7540 x7575",
        "website": "trustworthy-department.name",
        "company": {
          "name": "Kemmer Inc",
          "catchPhrase": "Profound needs-based framework"
        }
      }
    ];
    
    res.status(200).json(sampleUsers);
    return;
  }

  res.status(404).json({ error: 'Not found' });
};
