# 🐳 Docker Development Environment

This project uses Docker for a consistent, professional development experience that mirrors production environments.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Dev     │    │   Staging       │    │   Production    │
│                 │    │                 │    │                 │
│ Docker Compose  │───▶│ GitHub Actions  │───▶│ Vercel + Redis  │
│ Redis Dev       │    │ Redis Staging   │    │ Redis Prod      │
│ 1K records      │    │ 10K records     │    │ Real data       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop 4.0+
- Node.js 22+ (for local development)
- Git

### Start Development Environment
```bash
# Clone and setup
git clone <your-repo>
cd user-lens

# Start full development environment
npm run docker:dev

# Or start in detached mode
npm run docker:dev:detached
```

### Access Services
- **Application**: http://localhost:5173
- **API**: http://localhost:3001
- **Redis GUI**: http://localhost:8082 (when tools profile is active)

## 📋 Available Commands

### Development
```bash
# Start development environment
npm run docker:dev                    # Foreground with logs
npm run docker:dev:detached          # Background mode
npm run docker:dev:logs              # View logs

# Database operations
npm run docker:seed                   # Seed database with test data
npm run db:migrate run               # Run pending migrations
npm run db:reset -- --force         # Reset and reseed database
```

### Tools & Utilities
```bash
# Start Redis Commander (GUI)
npm run docker:tools

# Production-like environment (with Nginx)
npm run docker:prod-like

# Stop everything
npm run docker:stop

# Clean everything (removes volumes)
npm run docker:clean
```

## 🗄️ Database Environments

### Local Development
- **Size**: 1,000 synthetic records
- **Purpose**: Fast development iteration
- **Reset**: Daily (automatic)

### Staging
- **Size**: 10,000 mixed records (synthetic + anonymized)
- **Purpose**: Integration testing, demo
- **Reset**: Weekly

### Production
- **Size**: Unlimited real data
- **Purpose**: Live application
- **Backup**: Automated daily

## 🧩 Docker Services

### Core Services
- **app**: Main application (React + Express)
- **redis-dev**: Development Redis instance
- **redis-test**: Testing Redis instance

### Optional Services (Profiles)
- **redis-cluster**: Redis cluster simulation
- **db-seeder**: Database seeding utility
- **redis-commander**: Redis GUI tool
- **nginx**: Production-like reverse proxy

## 🔧 Configuration

### Environment Files
```
.env.development    # Local Docker development
.env.staging        # GitHub Actions staging
.env.production     # Vercel production
```

### Redis Configuration
```
docker/redis/redis-dev.conf     # Development settings
docker/redis/redis-test.conf    # Test settings (no persistence)
```

## 🌱 Database Seeding

The seeding system automatically creates environment-appropriate data:

```bash
# Development (1K records)
NODE_ENV=development npm run db:seed

# Staging (10K records)
NODE_ENV=staging npm run db:seed

# Custom size
DB_SEED_SIZE=500 npm run db:seed
```

## 🚀 Migrations

Database migrations ensure consistent schema across environments:

```bash
# Run pending migrations
npm run db:migrate run

# Check migration status
npm run db:migrate status

# Create new migration
npm run db:migrate create add_user_preferences
```

## 🔍 Monitoring & Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f redis-dev
```

### Redis Monitoring
```bash
# Access Redis CLI
docker-compose exec redis-dev redis-cli

# Monitor Redis commands
docker-compose exec redis-dev redis-cli monitor

# Check Redis info
docker-compose exec redis-dev redis-cli info
```

### Health Checks
All services include health checks that are monitored by Docker:
```bash
# Check service health
docker-compose ps
```

## 🎯 Production Deployment

### GitHub Actions Workflow
1. **Push to develop** → Deploy to staging
2. **Push to main** → Deploy to production
3. **Automatic migrations** run on deployment
4. **Environment-specific seeding** (staging only)

### Vercel Integration
- **Staging**: `user-lens-staging.vercel.app`
- **Production**: `user-lens.vercel.app`
- **Environment variables** managed through Vercel dashboard

## 🐛 Troubleshooting

### Common Issues

**Redis connection errors:**
```bash
# Restart Redis
docker-compose restart redis-dev

# Check Redis logs
docker-compose logs redis-dev
```

**Port conflicts:**
```bash
# Stop conflicting services
npm run docker:stop

# Clean everything
npm run docker:clean
```

**Out of sync data:**
```bash
# Reset database
npm run db:reset -- --force
```

### Performance Optimization

**Slow startup:**
- Use `npm run docker:dev:detached` for background startup
- Increase Docker memory allocation (Docker Desktop settings)

**Database performance:**
- Development Redis is optimized for development (persistence enabled)
- Test Redis is optimized for speed (no persistence)

## 🔐 Security Considerations

### Development Environment
- Redis is exposed on localhost only
- No authentication required for local development
- Debug logging enabled

### Production Environment
- Redis secured with authentication
- SSL/TLS encryption enabled
- Minimal logging for performance

## 📊 Best Practices

### Development Workflow
1. **Start environment**: `npm run docker:dev`
2. **Run migrations**: `npm run db:migrate run`
3. **Develop features** with hot reload
4. **Test changes** with `npm run test`
5. **Commit and push** to trigger CI/CD

### Database Management
1. **Create migrations** for schema changes
2. **Test migrations** in staging first
3. **Seed staging** with realistic data
4. **Never modify production** data directly

## 🤝 Contributing

When adding new features:
1. Create database migrations if needed
2. Update seed scripts for new data requirements
3. Add environment variables to all `.env` files
4. Update Docker services if needed
5. Test with `npm run docker:dev`

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Redis Configuration Guide](https://redis.io/documentation)
- [Twelve-Factor App Methodology](https://12factor.net/)
- [Vercel Deployment Guide](https://vercel.com/docs)
