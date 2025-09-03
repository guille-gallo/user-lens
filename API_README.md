# User Lens API

This is a mock REST API for the User Lens application, built with json-server and deployed on Vercel.

## API Endpoints

Base URL: `https://your-vercel-deployment-url.vercel.app/api`

### Users
- `GET /api/users` - Get all users
- `GET /api/users?_page=1&_limit=10` - Get paginated users
- `GET /api/users?q=search_term` - Search users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Query Parameters
- `_page` - Page number for pagination
- `_limit` - Number of items per page
- `q` - Search term (searches across name, email, and company)
- `_sort` - Sort by field
- `_order` - Sort order (asc/desc)

## Dataset
Contains 10,000 generated users with realistic data including:
- Personal information (name, email, phone)
- Address details
- Company information
- Geographic coordinates

## Local Development
```bash
npm run json-server
```

## Deployment
This API is automatically deployed to Vercel when changes are pushed to the main branch.
