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

  // Create json-server instance
  const server = jsonServer.create();
  const router = jsonServer.router(path.join(__dirname, '../db.json'));
  const middlewares = jsonServer.defaults();

  // Rewrite the URL to remove /api prefix for json-server
  const originalUrl = req.url;
  req.url = req.url.replace('/api', '');

  server.use(middlewares);
  server.use(router);
  
  // Handle the request
  server.handle(req, res);
};
