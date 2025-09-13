import { createClient } from 'redis';
import MemoryStorage from './memoryStorage.js';

class RedisConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.memoryStorage = new MemoryStorage();
    this.usingMemoryFallback = false;
  }

  async connect() {
    // If already connected to Redis, return existing connection
    if (this.isConnected && this.client) {
      return this.client;
    }

    // First priority: Try to connect to deployed Redis database
    if (process.env.REDIS_URL) {
      try {
        console.log('🔄 Attempting to connect to deployed Redis database...');
        
        this.client = createClient({
          url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('✅ Connected to deployed Redis database successfully');
          this.isConnected = true;
          this.usingMemoryFallback = false;
        });

        this.client.on('disconnect', () => {
          console.log('❌ Disconnected from Redis database');
          this.isConnected = false;
        });

        await this.client.connect();
        return this.client;
      } catch (error) {
        console.error('❌ Failed to connect to deployed Redis database:', error.message);
        console.log('📁 Falling back to local data files...');
        this.isConnected = false;
        this.usingMemoryFallback = true;
        return this.memoryStorage;
      }
    } else {
      console.warn('⚠️  Redis URL not configured - using local data fallback');
      this.usingMemoryFallback = true;
      return this.memoryStorage;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  getClient() {
    if (this.usingMemoryFallback) {
      return this.memoryStorage;
    }
    if (!this.isConnected || !this.client) {
      throw new Error('Redis client not connected. Call connect() first.');
    }
    return this.client;
  }

  isUsingMemoryFallback() {
    return this.usingMemoryFallback;
  }
}

// Create a singleton instance
const redisConnection = new RedisConnection();

export default redisConnection;
