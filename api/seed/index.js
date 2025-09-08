import { createClient } from 'redis';
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  // Allow CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First, let's just test if the endpoint works
    res.status(200).json({ 
      message: 'Seed endpoint is working',
      redis_url_exists: !!process.env.REDIS_URL,
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
