// Simple in-memory storage fallback when Redis is not available
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MemoryStorage {
  constructor() {
    this.data = new Map();
    this.initializeSampleData();
  }

  initializeSampleData() {
    try {
      console.log('📁 Initializing fallback data storage...');
      
      // Try to load from db.json first (full dataset)
      const dbPath = path.join(__dirname, '../../db.json');
      if (fs.existsSync(dbPath)) {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (dbData.users && Array.isArray(dbData.users)) {
          this.data.set('users', JSON.stringify(dbData.users));
          console.log(`📊 Loaded ${dbData.users.length} users from db.json as fallback data`);
          return;
        }
      }

      // Fallback to db-small.json if available
      const dbSmallPath = path.join(__dirname, '../../db-small.json');
      if (fs.existsSync(dbSmallPath)) {
        const dbSmallData = JSON.parse(fs.readFileSync(dbSmallPath, 'utf8'));
        if (dbSmallData.users && Array.isArray(dbSmallData.users)) {
          this.data.set('users', JSON.stringify(dbSmallData.users));
          console.log(`📊 Loaded ${dbSmallData.users.length} users from db-small.json as fallback data`);
          return;
        }
      }

      // Final fallback to hardcoded sample data
      console.log('📊 Using hardcoded sample data as final fallback');
      this.loadHardcodedSampleData();
    } catch (error) {
      console.error('Error loading fallback data files, using hardcoded sample:', error);
      this.loadHardcodedSampleData();
    }
  }

  loadHardcodedSampleData() {
    // Add some sample users for development
    const sampleUsers = [
      {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        email: "john.doe@example.com",
        address: {
          street: "123 Main St",
          suite: "Apt 1",
          city: "New York",
          zipcode: "10001",
          geo: { lat: "40.7128", lng: "-74.0060" }
        },
        phone: "555-0001",
        website: "johndoe.com",
        company: {
          name: "Tech Corp",
          catchPhrase: "Innovation at its finest",
          bs: "optimize cutting-edge solutions"
        }
      },
      {
        id: 2,
        name: "Jane Smith",
        username: "janesmith",
        email: "jane.smith@example.com",
        address: {
          street: "456 Oak Ave",
          suite: "Suite 200",
          city: "Los Angeles",
          zipcode: "90210",
          geo: { lat: "34.0522", lng: "-118.2437" }
        },
        phone: "555-0002",
        website: "janesmith.com",
        company: {
          name: "Digital Solutions",
          catchPhrase: "Smart technology for everyone",
          bs: "revolutionize digital experiences"
        }
      }
    ];

    this.data.set('users', JSON.stringify(sampleUsers));
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async set(key, value, options = {}) {
    this.data.set(key, value);
    
    // Handle expiration if provided
    if (options.EX) {
      setTimeout(() => {
        this.data.delete(key);
      }, options.EX * 1000);
    }
    
    return 'OK';
  }

  async del(key) {
    const existed = this.data.has(key);
    this.data.delete(key);
    return existed ? 1 : 0;
  }

  async exists(key) {
    return this.data.has(key) ? 1 : 0;
  }

  async keys(pattern = '*') {
    if (pattern === '*') {
      return Array.from(this.data.keys());
    }
    // Simple pattern matching for basic patterns
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async flushall() {
    this.data.clear();
    return 'OK';
  }
}

export default MemoryStorage;
