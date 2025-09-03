export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Sample users data
  const sampleUsers = [
    {
      "id": 1,
      "name": "Jon Marquardt III",
      "username": "Benjamin_Olson84",
      "email": "Dorthy39@gmail.com",
      "address": {
        "street": "9588 Cortez Wells",
        "suite": "Suite 245",
        "city": "North Joeboro",
        "zipcode": "66761-3353"
      },
      "phone": "1-826-364-9052 x31711",
      "website": "adolescent-lobster.org",
      "company": {
        "name": "Hodkiewicz LLC",
        "catchPhrase": "Face to face full-range emulation",
        "bs": "empower cutting-edge synergies"
      }
    },
    {
      "id": 2,
      "name": "Elias Wolf DVM",
      "username": "Myron38",
      "email": "Jennings77@gmail.com",
      "address": {
        "street": "320 Forest Road",
        "suite": "Suite 670",
        "city": "Tracyside",
        "zipcode": "36224"
      },
      "phone": "367.856.7540 x7575",
      "website": "trustworthy-department.name",
      "company": {
        "name": "Kemmer Inc",
        "catchPhrase": "Profound needs-based framework",
        "bs": "whiteboard extensible initiatives"
      }
    },
    {
      "id": 3,
      "name": "Johnny Bogan",
      "username": "Gaston.Howell",
      "email": "Orion49@yahoo.com",
      "address": {
        "street": "2243 Fahey Cove",
        "suite": "Suite 724",
        "city": "Fort Aricfield",
        "zipcode": "46027"
      },
      "phone": "912.274.3477 x2666",
      "website": "graceful-alligator.name",
      "company": {
        "name": "Kulas - Cassin",
        "catchPhrase": "Monitored incremental help-desk",
        "bs": "maximize plug-and-play interfaces"
      }
    }
  ];

  try {
    if (req.method === 'GET') {
      // Get query parameters
      const { _page = '1', _limit = '20', q = '', _sort, _order = 'asc' } = req.query;
      
      let users = [...sampleUsers];

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
