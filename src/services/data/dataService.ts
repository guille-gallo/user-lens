import { userService } from '../api/userService';
import { MOCK_USERS } from './mockData';
import type { User } from '../../types';
import { normalizeUser, normalizeUsers } from '../../utils/dataTransforms';

/**
 * Data Service with Smart Timeout & Fallback Strategy
 * 
 * Architecture:
 * - JSONPlaceholder is a fake API that doesn't persist data across sessions
 * - We use localStorage to simulate persistent data for better UX
 * - Graceful degradation: API → Cached Data → Mock Data
 * - All mutations (create/update/delete) happen optimistically in localStorage
 * - Timeouts are handled internally without exposing errors to users
 */

/**
 * Local storage utilities for caching data
 */
const STORAGE_KEYS = {
  USERS: 'user-lens-users-cache',
  LAST_FETCH: 'user-lens-last-fetch'
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const API_TIMEOUT = 8000; // 8 seconds

/**
 * Timeout wrapper that doesn't throw timeout errors
 * Falls back gracefully instead of showing timeout to users
 */
const fetchWithFallback = async <T>(
  apiCall: () => Promise<T>,
  fallbackData: () => T | null,
  operation: string
): Promise<T> => {
  try {
    // Race between API call and timeout
    const result = await Promise.race([
      apiCall(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Internal timeout')), API_TIMEOUT)
      )
    ]);
    return result;
  } catch (error) {
    console.warn(`⚠️ ${operation} failed:`, (error as Error).message);
    
    const fallback = fallbackData();
    if (fallback) {
      console.log(`💾 Using fallback data for ${operation}`);
      return fallback;
    }
    
    // Only throw if no fallback is available
    throw new Error(`Failed to ${operation.toLowerCase()} - service unavailable`);
  }
};

/**
 * Data service with fallback strategy:
 * 1. Try to fetch from API
 * 2. If API fails, check localStorage cache
 * 3. If no cache or cache expired, use mock data
 * 4. Always cache successful API responses
 */
export const dataService = {
  /**
   * Get all users with smart fallback strategy
   */
  getUsers: async (): Promise<User[]> => {
    return fetchWithFallback(
      async () => {
        console.log('🌐 Attempting to fetch users from API...');
        const response = await userService.getUsers();
        const users = response.data; // Extract users from paginated response
        
        // Cache successful response
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
        
        console.log('✅ Successfully fetched and cached users from API');
        return users;
      },
      () => {
        // Try cached data first
        const cachedUsers = getCachedUsers();
        if (cachedUsers) {
          console.log('💾 Using cached users from localStorage');
          return cachedUsers;
        }
        
        // Fallback to mock data
        console.log('🎭 Using mock data as fallback');
        return MOCK_USERS;
      },
      'Get users'
    );
  },

  /**
   * Get user by ID with smart fallback strategy
   */
  getUserById: async (id: number): Promise<User> => {
    return fetchWithFallback(
      async () => {
        console.log(`🌐 Attempting to fetch user ${id} from API...`);
        const user = await userService.getUserById(id);
        console.log(`✅ Successfully fetched user ${id} from API`);
        return user;
      },
      () => {
        // Try cached data first
        const cachedUsers = getCachedUsers();
        if (cachedUsers) {
          const cachedUser = cachedUsers.find(u => u.id === id);
          if (cachedUser) {
            console.log(`💾 Using cached user ${id} from localStorage`);
            return normalizeUser(cachedUser);
          }
        }
        
        // Fallback to mock data
        const mockUser = MOCK_USERS.find(u => u.id === id);
        if (mockUser) {
          console.log(`🎭 Using mock data for user ${id}`);
          return normalizeUser(mockUser);
        }
        
        return null; // Will cause the outer function to throw
      },
      `Get user ${id}`
    );
  },

  /**
   * Create user - Smart persistence strategy for JSONPlaceholder
   * Since JSONPlaceholder doesn't persist data, we handle this optimistically:
   * 1. Try API call (for realistic UX/testing)
   * 2. Always persist to localStorage regardless of API result
   * 3. Generate stable local ID for consistent experience
   */
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    // Get current users from localStorage or fallback to cached/mock data
    const currentUsers = getCurrentUsers();
    
    // Generate new ID based on current data
    const newId = Math.max(...currentUsers.map(u => u.id), 0) + 1;
    const newUser = { ...userData, id: newId };
    
    try {
      console.log('🌐 Attempting to create user via API...');
      await Promise.race([
        userService.createUser(userData),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT)
        )
      ]);
      console.log('✅ API acknowledged user creation');
    } catch (error) {
      console.warn('⚠️ API create failed, proceeding with local storage:', (error as Error).message);
    }
    
    // Always persist locally (JSONPlaceholder is fake anyway)
    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    console.log('💾 User persisted to localStorage');
    
    return newUser;
  },

  /**
   * Update user - Smart persistence strategy  
   */
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    // Get current users from localStorage or fallback to cached/mock data
    const currentUsers = getCurrentUsers();
    
    const existingUser = currentUsers.find(u => u.id === id);
    
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...existingUser, ...userData };
    
    try {
      console.log(`🌐 Attempting to update user ${id} via API...`);
      await Promise.race([
        userService.updateUser(id, userData),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT)
        )
      ]);
      console.log('✅ API acknowledged user update');
    } catch (error) {
      console.warn('⚠️ API update failed, proceeding with local storage:', (error as Error).message);
    }
    
    // Always persist locally
    const updatedUsers = currentUsers.map(u => u.id === id ? updatedUser : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    console.log('💾 User update persisted to localStorage');
    
    return updatedUser;
  },

  /**
   * Delete user - Smart persistence strategy
   */
  deleteUser: async (id: number): Promise<void> => {
    // Get all current users (cache + any new ones)
    const allUsers = getCurrentUsers();
    
    const userExists = allUsers.some(u => u.id === id);
    
    if (!userExists) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    try {
      console.log(`🌐 Attempting to delete user ${id} via API...`);
      await Promise.race([
        userService.deleteUser(id),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT)
        )
      ]);
      console.log('✅ API acknowledged user deletion');
    } catch (error) {
      console.warn('⚠️ API delete failed, proceeding with local storage:', (error as Error).message);
    }
    
    // Always persist locally - remove from current users
    const updatedUsers = allUsers.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    console.log('💾 User deletion persisted to localStorage');
  },

  /**
   * Clear cached data (useful for testing or manual refresh)
   */
  clearCache: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
    console.log('🗑️ Cache cleared');
  }
};

/**
 * Get cached users if they exist and are not expired
 */
function getCachedUsers(): User[] | null {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEYS.USERS);
    const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
    
    if (!cachedData || !lastFetch) {
      return null;
    }
    
    const cacheAge = Date.now() - parseInt(lastFetch);
    if (cacheAge > CACHE_DURATION) {
      console.log('💾 Cache expired, removing...');
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
      return null;
    }
    
    const users = JSON.parse(cachedData);
    return normalizeUsers(users);
  } catch (error) {
    console.warn('💾 Error reading cache:', error);
    return null;
  }
}

/**
 * Get current users from localStorage first, fallback to cache/mock
 * This ensures we always work with the most current data including new users
 */
function getCurrentUsers(): User[] {
  const currentStoredUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (currentStoredUsers) {
    try {
      return JSON.parse(currentStoredUsers);
    } catch {
      console.warn('Failed to parse stored users, using fallback');
    }
  }
  return getCachedUsers() || MOCK_USERS;
}
