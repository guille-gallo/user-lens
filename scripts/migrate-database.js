import { createConnection } from 'redis';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Database Migration System
 * Handles schema and data migrations across environments
 */
class DatabaseMigrator {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
    this.migrationsPath = join(__dirname, '../migrations');
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
   * Initialize migration tracking
   */
  async initializeMigrationTracking() {
    const migrations = await this.redis.get('migrations:applied');
    if (!migrations) {
      await this.redis.set('migrations:applied', JSON.stringify([]));
      console.log('📋 Initialized migration tracking');
    }
  }

  /**
   * Get list of applied migrations
   */
  async getAppliedMigrations() {
    const migrations = await this.redis.get('migrations:applied');
    return migrations ? JSON.parse(migrations) : [];
  }

  /**
   * Mark migration as applied
   */
  async markMigrationApplied(migrationName) {
    const applied = await this.getAppliedMigrations();
    if (!applied.includes(migrationName)) {
      applied.push(migrationName);
      await this.redis.set('migrations:applied', JSON.stringify(applied));
    }
  }

  /**
   * Get list of available migration files
   */
  async getAvailableMigrations() {
    try {
      const files = await readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.js'))
        .sort();
    } catch (error) {
      console.warn('⚠️  Migrations directory not found, creating...');
      return [];
    }
  }

  /**
   * Get pending migrations that need to be applied
   */
  async getPendingMigrations() {
    const available = await this.getAvailableMigrations();
    const applied = await this.getAppliedMigrations();
    
    return available.filter(migration => !applied.includes(migration));
  }

  /**
   * Load and execute a migration file
   */
  async executeMigration(migrationFile) {
    try {
      const migrationPath = join(this.migrationsPath, migrationFile);
      console.log(`⚡ Executing migration: ${migrationFile}`);
      
      // Dynamic import of migration file
      const migration = await import(`file://${migrationPath}`);
      
      if (typeof migration.up !== 'function') {
        throw new Error(`Migration ${migrationFile} must export an 'up' function`);
      }

      // Execute the migration
      await migration.up(this.redis);
      
      // Mark as applied
      await this.markMigrationApplied(migrationFile);
      
      console.log(`✅ Migration ${migrationFile} applied successfully`);
      
    } catch (error) {
      console.error(`❌ Migration ${migrationFile} failed:`, error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations() {
    console.log(`🚀 Starting migrations for ${this.environment} environment`);
    
    await this.initializeMigrationTracking();
    
    const pending = await this.getPendingMigrations();
    
    if (pending.length === 0) {
      console.log('✨ No pending migrations');
      return;
    }

    console.log(`📋 Found ${pending.length} pending migrations:`);
    pending.forEach(migration => console.log(`   - ${migration}`));

    for (const migration of pending) {
      await this.executeMigration(migration);
    }

    console.log(`🎉 Applied ${pending.length} migrations successfully!`);
  }

  /**
   * Create a new migration file template
   */
  async createMigration(name) {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const filename = `${timestamp}_${name}.js`;
    const filepath = join(this.migrationsPath, filename);

    const template = `/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 * Environment: ${this.environment}
 */

/**
 * Apply migration
 * @param {Object} redis - Redis connection
 */
export async function up(redis) {
  console.log('Running migration: ${name}');
  
  // Add your migration logic here
  // Example:
  // const users = await redis.get('users');
  // if (users) {
  //   const parsedUsers = JSON.parse(users);
  //   // Modify users data structure
  //   await redis.set('users', JSON.stringify(parsedUsers));
  // }
}

/**
 * Rollback migration (optional)
 * @param {Object} redis - Redis connection
 */
export async function down(redis) {
  console.log('Rolling back migration: ${name}');
  
  // Add your rollback logic here
  // This is optional but recommended for destructive changes
}

export default { up, down };
`;

    await writeFile(filepath, template);
    console.log(`📝 Created migration: ${filename}`);
    return filename;
  }

  /**
   * Show migration status
   */
  async showStatus() {
    const available = await this.getAvailableMigrations();
    const applied = await this.getAppliedMigrations();
    const pending = await this.getPendingMigrations();

    console.log('📊 Migration Status:');
    console.log(`   Environment: ${this.environment}`);
    console.log(`   Available: ${available.length}`);
    console.log(`   Applied: ${applied.length}`);
    console.log(`   Pending: ${pending.length}`);

    if (applied.length > 0) {
      console.log('\n✅ Applied Migrations:');
      applied.forEach(migration => console.log(`   - ${migration}`));
    }

    if (pending.length > 0) {
      console.log('\n⏳ Pending Migrations:');
      pending.forEach(migration => console.log(`   - ${migration}`));
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const command = process.argv[2];
  const migrator = new DatabaseMigrator();

  try {
    await migrator.connect();

    switch (command) {
      case 'run':
        await migrator.runMigrations();
        break;
      
      case 'status':
        await migrator.showStatus();
        break;
      
      case 'create':
        const name = process.argv[3];
        if (!name) {
          throw new Error('Migration name is required: npm run db:migrate create <name>');
        }
        await migrator.createMigration(name);
        break;
      
      default:
        console.log('Usage:');
        console.log('  npm run db:migrate run     - Run pending migrations');
        console.log('  npm run db:migrate status  - Show migration status');
        console.log('  npm run db:migrate create <name> - Create new migration');
        break;
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await migrator.disconnect();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DatabaseMigrator };
