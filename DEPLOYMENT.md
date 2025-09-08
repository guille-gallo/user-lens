# Vercel Deployment Guide

## Overview

This guide explains how to deploy the User Lens application with Redis backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Redis Database**: You need a Redis instance (Redis Cloud, Upstash, etc.)
3. **GitHub Repository**: Code should be in a GitHub repository

## Setup Steps

### 1. Configure Redis

You need a Redis URL in the format:
```
redis://username:password@host:port
```

**Recommended Redis Providers:**
- **Upstash** (Vercel-friendly): https://upstash.com/
- **Redis Cloud**: https://redis.com/cloud/
- **Railway**: https://railway.app/

### 2. Deploy to Vercel

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add: `REDIS_URL` with your Redis connection string

3. **Deploy**:
   - Vercel will automatically build and deploy
   - The app will be available at `https://your-project.vercel.app`

### 3. Test Deployment

After deployment, test the API endpoints:

```bash
# Run the test script
./scripts/test-deployment.sh

# Or manually test endpoints:
curl https://your-project.vercel.app/api/health
curl https://your-project.vercel.app/api/test-redis
curl https://your-project.vercel.app/api/seed
curl https://your-project.vercel.app/api/users
```

### 4. Seed the Database

The Redis database starts empty. Seed it with initial data:

```bash
# Seed the database
curl https://your-project.vercel.app/api/seed

# Verify users were created
curl https://your-project.vercel.app/api/users
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health check |
| `/api/test-redis` | GET | Test Redis connection |
| `/api/seed` | GET | Seed database with sample data |
| `/api/users` | GET | Get all users (with pagination/search) |
| `/api/users` | POST | Create new user |
| `/api/users/[id]` | GET | Get user by ID |
| `/api/users/[id]` | PUT | Update user |
| `/api/users/[id]` | DELETE | Delete user |

## Query Parameters

### Users Endpoint (`/api/users`)
- `_page`: Page number (default: 1)
- `_limit`: Items per page (default: 20)
- `q`: Search term (searches name, email, username, company)
- `_sort`: Sort field (e.g., 'name', 'email')
- `_order`: Sort order ('asc' or 'desc')

Examples:
```bash
# Get first 10 users
curl "https://your-project.vercel.app/api/users?_page=1&_limit=10"

# Search for users
curl "https://your-project.vercel.app/api/users?q=john"

# Sort by name
curl "https://your-project.vercel.app/api/users?_sort=name&_order=desc"
```

## Troubleshooting

### Common Issues

1. **"Redis URL not configured"**
   - Check environment variables in Vercel dashboard
   - Ensure `REDIS_URL` is set correctly

2. **"Redis connection failed"**
   - Verify Redis instance is running and accessible
   - Check Redis URL format and credentials
   - Ensure Redis allows connections from Vercel IPs

3. **Empty users array**
   - Run the seed endpoint: `curl https://your-project.vercel.app/api/seed`
   - Check if seed was successful

4. **CORS errors**
   - API endpoints include CORS headers
   - If issues persist, check browser console for specific errors

### Debugging Steps

1. **Check health endpoint**: Start with `/api/health`
2. **Test Redis connection**: Use `/api/test-redis`
3. **Check Vercel logs**: Go to Vercel dashboard > Functions tab
4. **Verify environment variables**: Check project settings

## File Structure

```
api/
├── health.js              # Health check endpoint
├── test-redis/
│   └── index.js           # Redis connection test
├── seed/
│   └── index.js           # Database seeding
├── users/
│   ├── index.js           # Users CRUD operations
│   └── [id].js            # Individual user operations
└── notifications/
    └── index.js           # Notifications endpoint
```

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | `redis://user:pass@host:port` |

## Performance Considerations

- Redis connections are opened/closed per request (serverless)
- Consider connection pooling for high-traffic applications
- Monitor Redis memory usage with large datasets

## Security

- All endpoints include CORS headers
- Input validation on user IDs
- Error messages don't expose sensitive information
- Redis credentials stored as environment variables
