import { API_CONFIG, ENDPOINTS } from '../../constants/api';
import { BaseHttpService } from '../http/httpService';
import type { User, PaginationParams, PaginatedResponse } from '../../types';
import { normalizeUser, normalizeUsers } from '../../utils/dataTransforms';

/**
 * User Service - Handles all user-related API operations
 */
class UserService extends BaseHttpService {
  constructor() {
    // Use environment-based API URL
    const isProduction = window.location.hostname !== 'localhost';
    const apiUrl = isProduction ? API_CONFIG.VERCEL_API : API_CONFIG.LOCAL_API;
    super(apiUrl);
  }

  // Get users with pagination and server-side search
  async getUsers(params: PaginationParams = { page: 1, limit: 15 }, signal?: AbortSignal): Promise<PaginatedResponse<User>> {
    const { page, limit, searchTerm, sortField, sortOrder } = params;
    
    const queryParams = new URLSearchParams({
      _page: page.toString(),
      _limit: limit.toString(),
    });

    // Use json-server's full-text search parameter
    if (searchTerm && searchTerm.trim()) {
      queryParams.append('q', searchTerm.trim());
    }

    if (sortField) {
      queryParams.append('_sort', sortField);
      queryParams.append('_order', sortOrder || 'asc');
    }

    const users = await this.get<User[]>(`${ENDPOINTS.USERS}?${queryParams.toString()}`, signal);
    
    // For pagination info, we'll use a conservative estimate to avoid fetching all data
    // This is a compromise - we estimate total based on current page results
    let totalUsers: number;
    let totalPages: number;
    
    if (users.length < limit) {
      // If we got fewer results than requested, we're on the last page
      totalUsers = (page - 1) * limit + users.length;
      totalPages = page;
    } else {
      // If we got full page, assume there might be more data
      // This is an estimation - we'll show "Load More" style pagination
      totalUsers = page * limit; // Conservative estimate
      totalPages = page + 1; // At least one more page potentially
    }

    return {
      data: normalizeUsers(users),
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages,
        hasNext: users.length === limit, // True if current page is full
        hasPrev: page > 1,
      },
    };
  }

  // Get single user by ID
  async getUserById(id: number): Promise<User> {
    const user = await this.get<User>(`${ENDPOINTS.USERS}/${id}`);
    return normalizeUser(user);
  }

  // Create new user
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const user = await this.post<User>(ENDPOINTS.USERS, userData);
    return normalizeUser(user);
  }

  // Update user
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.put<User>(`${ENDPOINTS.USERS}/${id}`, userData);
    return normalizeUser(user);
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    return this.delete(`${ENDPOINTS.USERS}/${id}`);
  }

  // Legacy method for backward compatibility (returns first page)
  async getAllUsers(): Promise<User[]> {
    const response = await this.getUsers({ page: 1, limit: 100 });
    return response.data;
  }
}

// Export singleton instance for performance (single HTTP client)
export const userService = new UserService();
