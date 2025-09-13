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

    // Make the request and get the response
    const url = `${ENDPOINTS.USERS}?${queryParams.toString()}`;
    
    try {
      // Try the new structured API format first (Express server)
      const response = await this.get<PaginatedResponse<User>>(url, signal);
      
      // Check if response has the new structured format
      if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
        return {
          data: normalizeUsers(response.data),
          pagination: response.pagination,
        };
      }
      
      // Fallback to old format (array + headers) for Vercel API
      const { data: users, headers } = await this.getWithHeaders<User[]>(url, signal);
      const totalCountHeader = headers.get('X-Total-Count');
      const totalUsers = totalCountHeader ? parseInt(totalCountHeader, 10) : users.length;
      const totalPages = Math.ceil(totalUsers / limit);

      return {
        data: normalizeUsers(users),
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      // Final fallback
      console.warn('Failed to get structured response, falling back to basic pagination:', error);
      const users = await this.get<User[]>(url, signal);
      return {
        data: normalizeUsers(users || []),
        pagination: {
          page,
          limit,
          total: users?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
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
    console.log('🌐 API Service - updateUser called with id:', id);
    console.log('🌐 API Service - Partial data to send:', userData);
    
    const user = await this.put<User>(`${ENDPOINTS.USERS}/${id}`, userData);
    const normalizedUser = normalizeUser(user);
    
    console.log('🌐 API Service - Raw response from API:', user);
    console.log('🌐 API Service - Normalized user to return:', normalizedUser);
    
    return normalizedUser;
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    console.log('🌐 API Service - deleteUser called with id:', id);
    try {
      const result = await this.delete(`${ENDPOINTS.USERS}/${id}`);
      console.log('🌐 API Service - Delete successful for user id:', id);
      return result;
    } catch (error) {
      console.error('🌐 API Service - Delete failed for user id:', id, error);
      throw error;
    }
  }

  // Legacy method for backward compatibility (returns first page)
  async getAllUsers(): Promise<User[]> {
    const response = await this.getUsers({ page: 1, limit: 100 });
    return response.data;
  }
}

// Export singleton instance for performance (single HTTP client)
export const userService = new UserService();
