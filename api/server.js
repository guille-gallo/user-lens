const jsonServer = require('json-server');
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

  try {
    // Create json-server instance
    const server = jsonServer.create();
    const router = jsonServer.router(path.join(__dirname, '../db.json'));
    const middlewares = jsonServer.defaults({
      noCors: true // Disable json-server's CORS since we handle it above
    });

    server.use(middlewares);
    server.use(router);
    
    // Handle the request
    server(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
