// Simple test endpoint without Redis dependency
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    res.status(200).json({
      message: 'API is working on Vercel!',
      timestamp: new Date().toISOString(),
      method: req.method,
      node_version: process.version,
      vercel_env: process.env.VERCEL_ENV || 'unknown',
      redis_url_configured: !!process.env.REDIS_URL
    });
  } catch (error) {
    console.error('Simple test error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}
