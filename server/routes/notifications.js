import express from 'express';

const router = express.Router();

// Sample notifications data (same as your serverless function)
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

// GET /api/notifications - Get all notifications
router.get('/', (req, res) => {
  try {
    res.status(200).json(sampleNotifications);
  } catch (error) {
    console.error('Notifications API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/notifications - Create new notification (future enhancement)
router.post('/', (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Creating notifications is not yet implemented'
  });
});

export default router;
