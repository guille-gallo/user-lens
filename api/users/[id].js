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
      const { id } = req.query;
      
      if (id) {
        const user = sampleUsers.find(u => u.id === parseInt(id));
        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      } else {
        res.status(400).json({ error: 'User ID is required' });
      }
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
