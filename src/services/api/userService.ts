import { API_CONFIG, ENDPOINTS } from '../../constants/api';
import { BaseHttpService } from '../http/httpService';
import type { User } from '../../types';

/**
 * User Service
 */
class UserService extends BaseHttpService {
  constructor() {
    super(API_CONFIG.JSONPLACEHOLDER);
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    return this.get<User[]>(ENDPOINTS.USERS);
  }

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    return this.get<User>(`${ENDPOINTS.USERS}/${id}`);
  }

  // Create user
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    return this.post<User>(ENDPOINTS.USERS, userData);
  }

  // Update user
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.put<User>(`${ENDPOINTS.USERS}/${id}`, userData);
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    return this.delete(`${ENDPOINTS.USERS}/${id}`);
  }
}

// Export singleton instance for performance (single HTTP client)
export const userService = new UserService();
