/**
 * Migration: Initial Schema Setup
 * Created: 2025-09-13T18:30:00.000Z
 * Environment: all
 */

/**
 * Apply migration - Setup initial database structure
 * @param {Object} redis - Redis connection
 */
export async function up(redis) {
  console.log('Running migration: Initial Schema Setup');
  
  // Initialize database metadata
  const metadata = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastMigration: '001_initial_schema_setup',
    environment: process.env.NODE_ENV || 'development'
  };
  
  await redis.set('database:metadata', JSON.stringify(metadata));
  
  // Initialize user indices for better performance
  const users = await redis.get('users');
  if (users) {
    const parsedUsers = JSON.parse(users);
    
    // Create email index for faster lookups
    const emailIndex = {};
    parsedUsers.forEach(user => {
      if (user.email) {
        emailIndex[user.email] = user.id;
      }
    });
    
    await redis.set('users:index:email', JSON.stringify(emailIndex));
    console.log(`✅ Created email index for ${Object.keys(emailIndex).length} users`);
  }
  
  console.log('✅ Initial schema setup completed');
}

/**
 * Rollback migration
 * @param {Object} redis - Redis connection
 */
export async function down(redis) {
  console.log('Rolling back migration: Initial Schema Setup');
  
  // Remove indices
  await redis.del('users:index:email');
  await redis.del('database:metadata');
  
  console.log('✅ Initial schema setup rolled back');
}

export default { up, down };
