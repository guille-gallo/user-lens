import { createConnection } from 'redis';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateData } from './generate-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Environment-specific database seeding
 * Supports multiple environments with different data requirements
 */
class DatabaseSeeder {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.seedSize = parseInt(process.env.DB_SEED_SIZE || '1000');
    this.seedType = process.env.DB_SEED_TYPE || 'synthetic';
    this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
  }

  async connect() {
    console.log(`🌱 Connecting to Redis: ${this.redisUrl}`);
    this.redis = createConnection({ url: this.redisUrl });
    
    this.redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('✅ Connected to Redis successfully');
    });

    await this.redis.connect();
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
      console.log('🔌 Disconnected from Redis');
    }
  }

  /**
   * Get seed data based on environment and type
   */
  async getSeedData() {
    console.log(`📊 Generating ${this.seedSize} records for ${this.environment} environment`);

    switch (this.seedType) {
      case 'synthetic':
        return this.generateSyntheticData();
      
      case 'synthetic_plus_anonymized':
        return this.generateMixedData();
      
      case 'minimal':
        return this.generateMinimalData();
      
      case 'none':
        return [];
      
      default:
        return this.generateSyntheticData();
    }
  }

  /**
   * Generate synthetic test data
   */
  generateSyntheticData() {
    console.log('🔧 Generating synthetic data...');
    return generateData(this.seedSize);
  }

  /**
   * Generate mixed synthetic + anonymized data (staging)
   */
  generateMixedData() {
    console.log('🔧 Generating mixed synthetic + anonymized data...');
    const syntheticData = generateData(Math.floor(this.seedSize * 0.7));
    const anonymizedData = this.loadAnonymizedData(Math.floor(this.seedSize * 0.3));
    return [...syntheticData, ...anonymizedData];
  }

  /**
   * Generate minimal data for production-like testing
   */
  generateMinimalData() {
    console.log('🔧 Generating minimal data set...');
    return generateData(Math.min(100, this.seedSize));
  }

  /**
   * Load anonymized production data (for staging)
   */
  loadAnonymizedData(count) {
    try {
      const dataPath = join(__dirname, '../data/anonymized-users.json');
      const data = JSON.parse(readFileSync(dataPath, 'utf8'));
      return data.slice(0, count);
    } catch (error) {
      console.warn('⚠️  Anonymized data not found, using synthetic data instead');
      return generateData(count);
    }
  }

  /**
   * Seed the database with environment-appropriate data
   */
  async seedDatabase() {
    try {
      console.log(`🌱 Starting database seeding for ${this.environment} environment`);
      
      // Clear existing data
      await this.clearDatabase();
      
      // Get seed data
      const users = await this.getSeedData();
      
      if (users.length === 0) {
        console.log('📭 No data to seed (production mode)');
        return;
      }

      // Store users in Redis
      await this.redis.set('users', JSON.stringify(users));
      
      // Store metadata
      const metadata = {
        seedDate: new Date().toISOString(),
        environment: this.environment,
        recordCount: users.length,
        seedType: this.seedType,
        version: '1.0.0'
      };
      
      await this.redis.set('users:metadata', JSON.stringify(metadata));
      
      console.log(`✅ Successfully seeded ${users.length} users`);
      console.log(`📋 Metadata stored: ${JSON.stringify(metadata, null, 2)}`);
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  /**
   * Clear existing database data
   */
  async clearDatabase() {
    console.log('🧹 Clearing existing database data...');
    
    const keys = await this.redis.keys('users*');
    if (keys.length > 0) {
      await this.redis.del(keys);
      console.log(`🗑️  Cleared ${keys.length} keys`);
    } else {
      console.log('📭 No existing data to clear');
    }
  }

  /**
   * Verify database seeding
   */
  async verifySeeding() {
    try {
      const users = await this.redis.get('users');
      const metadata = await this.redis.get('users:metadata');
      
      if (!users) {
        throw new Error('No users data found');
      }
      
      const parsedUsers = JSON.parse(users);
      const parsedMetadata = metadata ? JSON.parse(metadata) : null;
      
      console.log('✅ Database verification successful:');
      console.log(`   📊 Users count: ${parsedUsers.length}`);
      console.log(`   🏷️  Environment: ${parsedMetadata?.environment || 'unknown'}`);
      console.log(`   📅 Seed date: ${parsedMetadata?.seedDate || 'unknown'}`);
      
      return true;
    } catch (error) {
      console.error('❌ Database verification failed:', error);
      return false;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const seeder = new DatabaseSeeder();
  
  try {
    await seeder.connect();
    await seeder.seedDatabase();
    await seeder.verifySeeding();
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.disconnect();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DatabaseSeeder };
