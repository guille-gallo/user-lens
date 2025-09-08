export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Sample notifications data
  const sampleNotifications = [
    {
      "id": 1,
      "type": "user_update",
      "title": "User Profile Updated",
      "message": "Jon Marquardt III updated their profile information",
      "timestamp": "2024-01-15T10:30:00Z",
      "isRead": false,
      "userId": 1
    },
    {
      "id": 2,
      "type": "system",
      "title": "System Maintenance",
      "message": "Scheduled maintenance will occur tonight from 2-4 AM EST",
      "timestamp": "2024-01-14T16:45:00Z",
      "isRead": true,
      "userId": null
    },
    {
      "id": 3,
      "type": "user_registration",
      "title": "New User Registration",
      "message": "Elias Wolf DVM has registered as a new user",
      "timestamp": "2024-01-14T14:20:00Z",
      "isRead": false,
      "userId": 2
    }
  ];

  try {
    if (req.method === 'GET') {
      res.status(200).json(sampleNotifications);
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
