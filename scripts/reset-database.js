import { createConnection } from 'redis';
import { DatabaseSeeder } from './seed-database.js';
import { DatabaseMigrator } from './migrate-database.js';

/**
 * Database Reset Utility
 * Completely resets database and re-seeds with fresh data
 */
class DatabaseResetter {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
  }

  async connect() {
    console.log(`🔗 Connecting to Redis: ${this.redisUrl}`);
    this.redis = createConnection({ url: this.redisUrl });
    
    this.redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    await this.redis.connect();
    console.log('✅ Connected to Redis successfully');
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
      console.log('🔌 Disconnected from Redis');
    }
  }

  /**
   * Completely reset the database
   */
  async resetDatabase() {
    console.log('🔄 Starting complete database reset...');
    
    // Check environment safety
    if (this.environment === 'production') {
      throw new Error('❌ Database reset is not allowed in production environment!');
    }

    // Flush all data
    await this.redis.flushDb();
    console.log('🧹 Flushed all database data');

    // Run migrations
    console.log('🚀 Running database migrations...');
    const migrator = new DatabaseMigrator();
    await migrator.connect();
    await migrator.runMigrations();
    await migrator.disconnect();

    // Re-seed database
    console.log('🌱 Re-seeding database...');
    const seeder = new DatabaseSeeder();
    await seeder.connect();
    await seeder.seedDatabase();
    await seeder.verifySeeding();
    await seeder.disconnect();

    console.log('✅ Database reset completed successfully!');
  }

  /**
   * Show reset confirmation prompt
   */
  showResetWarning() {
    console.log('⚠️  WARNING: This will completely reset your database!');
    console.log(`   Environment: ${this.environment}`);
    console.log(`   Redis URL: ${this.redisUrl}`);
    console.log('   All existing data will be lost!');
    console.log('');
    
    if (this.environment === 'production') {
      console.log('❌ RESET IS BLOCKED IN PRODUCTION');
      return false;
    }
    
    return true;
  }
}

/**
 * Main execution function
 */
async function main() {
  const resetter = new DatabaseResetter();
  
  // Show warning
  if (!resetter.showResetWarning()) {
    process.exit(1);
  }
  
  // Check for force flag
  const force = process.argv.includes('--force');
  if (!force) {
    console.log('To reset the database, run with --force flag:');
    console.log('npm run db:reset -- --force');
    process.exit(0);
  }

  try {
    await resetter.connect();
    await resetter.resetDatabase();
    
    console.log('🎉 Database reset completed successfully!');
    
  } catch (error) {
    console.error('💥 Database reset failed:', error);
    process.exit(1);
  } finally {
    await resetter.disconnect();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DatabaseResetter };
