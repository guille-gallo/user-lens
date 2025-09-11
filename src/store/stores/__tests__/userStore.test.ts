import { act, renderHook } from '@testing-library/react';
import { useUserStore } from '../userStore';
import { UserFilterCache } from '../../utils';

// Mock the userService directly where it's imported
jest.mock('../../../services/api/userService', () => ({
  userService: {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

// Import the mocked userService
import { userService } from '../../../services/api/userService';

jest.mock('../../utils', () => ({
  UserFilterCache: {
    clearCache: jest.fn(),
    getFilteredAndSortedUsers: jest.fn(),
  },
  StoreErrorHandler: {
    handleError: jest.fn(),
  },
}));

const mockUserService = userService as jest.Mocked<typeof userService>;
const mockUserFilterCache = UserFilterCache as jest.Mocked<typeof UserFilterCache>;

describe('userStore', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '+1-555-123-4567',
      website: 'johndoe.com',
      address: {
        street: '123 Main St',
        suite: 'Apt 4B',
        city: 'New York',
        zipcode: '10001',
        geo: { lat: '40.7128', lng: '-74.0060' }
      },
      company: {
        name: 'TechCorp',
        catchPhrase: 'Innovation at its best',
        bs: 'cutting-edge solutions'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      phone: '+1-555-987-6543',
      website: 'janesmith.com',
      address: {
        street: '456 Oak Ave',
        suite: 'Suite 2A',
        city: 'Los Angeles',
        zipcode: '90210',
        geo: { lat: '34.0522', lng: '-118.2437' }
      },
      company: {
        name: 'DesignCo',
        catchPhrase: 'Creative solutions',
        bs: 'user experience design'
      }
    }
  ];

  const mockPaginatedResponse = {
    data: mockUsers,
    pagination: {
      page: 1,
      limit: 15,
      total: mockUsers.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useUserStore.setState({
      users: [],
      selectedUser: null,
      loading: false,
      error: null,
      searchTerm: '',
      sortField: null,
      sortOrder: 'asc',
      lastFetch: 0,
      currentPage: 1,
      pageSize: 15,
      totalUsers: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.users).toEqual([]);
      expect(result.current.selectedUser).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.sortField).toBe(null);
      expect(result.current.sortOrder).toBe('asc');
    });
  });

  describe('Synchronous Actions', () => {
    it('should set users and clear cache', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUsers(mockUsers);
      });
      
      expect(result.current.users).toEqual(mockUsers);
      expect(mockUserFilterCache.clearCache).toHaveBeenCalled();
    });

    it('should set selected user', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setSelectedUser(mockUsers[0]);
      });
      
      expect(result.current.selectedUser).toEqual(mockUsers[0]);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useUserStore());
      const errorMessage = 'Something went wrong';
      
      act(() => {
        result.current.setError(errorMessage);
      });
      
      expect(result.current.error).toBe(errorMessage);
    });

    it('should set search term', () => {
      const { result } = renderHook(() => useUserStore());
      const searchTerm = 'john';
      
      act(() => {
        result.current.setSearchTerm(searchTerm);
      });
      
      expect(result.current.searchTerm).toBe(searchTerm);
    });

    it('should set sorting', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setSorting('name', 'desc');
      });
      
      expect(result.current.sortField).toBe('name');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('Async Actions - fetchUsers', () => {
    it('should fetch users successfully', async () => {
      mockUserService.getUsers.mockResolvedValueOnce(mockPaginatedResponse);
      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        await result.current.fetchUsers();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.error).toBe(null);
      expect(mockUserFilterCache.clearCache).toHaveBeenCalled();
    });

    it('should handle fetch users error', async () => {
      const errorMessage = 'Failed to load users';
      mockUserService.getUsers.mockRejectedValueOnce(new Error('Network error'));
      
      // Mock StoreErrorHandler
      const { StoreErrorHandler } = require('../../utils');
      StoreErrorHandler.handleError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        await result.current.fetchUsers();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.users).toEqual([]);
    });

    it('should set loading state during fetch', async () => {
      mockUserService.getUsers.mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve(mockPaginatedResponse), 100);
        })
      );
      
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.fetchUsers();
      });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Async Actions - fetchUserById', () => {
    it('should fetch user by id successfully', async () => {
      const userId = 1;
      mockUserService.getUserById.mockResolvedValueOnce(mockUsers[0]);
      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        await result.current.fetchUserById(userId);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.selectedUser).toEqual(mockUsers[0]);
      expect(result.current.error).toBe(null);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should handle fetch user by id error', async () => {
      const userId = 999;
      const errorMessage = 'Failed to load user';
      mockUserService.getUserById.mockRejectedValueOnce(new Error('User not found'));
      
      const { StoreErrorHandler } = require('../../utils');
      StoreErrorHandler.handleError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        await result.current.fetchUserById(userId);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.selectedUser).toBe(null);
    });
  });

  describe('Async Actions - createUser', () => {

    it('should handle create user error', async () => {
      const newUserData = {
        name: 'New User',
        username: 'newuser',
        email: 'invalid-email',
        phone: '+1-555-000-0000',
        website: 'newuser.com',
        address: mockUsers[0].address,
        company: mockUsers[0].company
      };
      const errorMessage = 'Failed to create user';
      
      mockUserService.createUser.mockRejectedValueOnce(new Error('Validation error'));
      
      const { StoreErrorHandler } = require('../../utils');
      StoreErrorHandler.handleError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        await result.current.createUser(newUserData);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Async Actions - updateUser', () => {

    it('should update user without affecting selected user if different', async () => {
      const userId = 1;
      const updateData = { name: 'John Updated' };
      const updatedUser = { ...mockUsers[0], ...updateData };
      
      mockUserService.updateUser.mockResolvedValueOnce(updatedUser);
      const { result } = renderHook(() => useUserStore());
      
      // Set initial users and different selected user
      act(() => {
        result.current.setUsers(mockUsers);
        result.current.setSelectedUser(mockUsers[1]); // Different user
      });
      
      await act(async () => {
        await result.current.updateUser(userId, updateData);
      });
      
      // Selected user should remain unchanged
      expect(result.current.selectedUser).toEqual(mockUsers[1]);
    });

    it('should handle update user error', async () => {
      const userId = 1;
      const updateData = { email: 'invalid-email' };
      const errorMessage = 'Failed to update user';
      
      mockUserService.updateUser.mockRejectedValueOnce(new Error('Validation error'));
      
      const { StoreErrorHandler } = require('../../utils');
      StoreErrorHandler.handleError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUsers(mockUsers);
      });
      
      await act(async () => {
        await result.current.updateUser(userId, updateData);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Async Actions - deleteUser', () => {

    it('should clear selected user if deleted user was selected', async () => {
      const userId = 1;
      
      mockUserService.deleteUser.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useUserStore());
      
      // Set initial users and select the user to be deleted
      act(() => {
        result.current.setUsers(mockUsers);
        result.current.setSelectedUser(mockUsers[0]);
      });
      
      await act(async () => {
        await result.current.deleteUser(userId);
      });
      
      expect(result.current.selectedUser).toBe(null);
    });

    it('should not affect selected user if different user is deleted', async () => {
      const userId = 1;
      
      mockUserService.deleteUser.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useUserStore());
      
      // Set initial users and select a different user
      act(() => {
        result.current.setUsers(mockUsers);
        result.current.setSelectedUser(mockUsers[1]); // Different user
      });
      
      await act(async () => {
        await result.current.deleteUser(userId);
      });
      
      expect(result.current.selectedUser).toEqual(mockUsers[1]);
    });

    it('should handle delete user error with user name', async () => {
      const userId = 1;
      const userToDelete = mockUsers[0];
      
      mockUserService.deleteUser.mockRejectedValueOnce(new Error('Access denied'));
      
      const { StoreErrorHandler } = require('../../utils');
      StoreErrorHandler.handleError.mockReturnValueOnce('Access denied');
      
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUsers(mockUsers);
      });
      
      await act(async () => {
        await result.current.deleteUser(userId);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(`Failed to delete ${userToDelete.name}: Access denied`);
    });

    it('should handle delete user error without user name', async () => {
      const userId = 999; // Non-existent user
      
      mockUserService.deleteUser.mockRejectedValueOnce(new Error('User not found'));
      
      const { StoreErrorHandler } = require('../../utils');
      StoreErrorHandler.handleError.mockReturnValueOnce('User not found');
      
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUsers(mockUsers);
      });
      
      await act(async () => {
        await result.current.deleteUser(userId);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to delete user: User not found');
    });
  });

  describe('Computed Values', () => {
    it('should call UserFilterCache for filtered and sorted users', () => {
      const filteredUsers = [mockUsers[0]];
      mockUserFilterCache.getFilteredAndSortedUsers.mockReturnValueOnce(filteredUsers);
      
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUsers(mockUsers);
        result.current.setSearchTerm('john');
        result.current.setSorting('name', 'desc');
      });
      
      const filtered = result.current.getFilteredAndSortedUsers();
      
      expect(mockUserFilterCache.getFilteredAndSortedUsers).toHaveBeenCalledWith(
        mockUsers,
        'john',
        'name',
        'desc'
      );
      expect(filtered).toEqual(filteredUsers);
    });
  });

  describe('Store Persistence', () => {
    it('should persist specific state properties', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUsers(mockUsers);
        result.current.setSearchTerm('test search');
        result.current.setSorting('name', 'desc');
        result.current.setLoading(true);
        result.current.setError('test error');
        result.current.setSelectedUser(mockUsers[0]);
      });
      
      // The persist configuration should only persist certain fields
      // This is handled by zustand's persist middleware
      // We can test that the store works correctly with the configuration
      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.searchTerm).toBe('test search');
      expect(result.current.sortField).toBe('name');
      expect(result.current.sortOrder).toBe('desc');
      
      // These should not be persisted but should work in current session
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe('test error');
      expect(result.current.selectedUser).toEqual(mockUsers[0]);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors consistently', async () => {
      const networkError = new Error('Network connection failed');
      
      const { StoreErrorHandler } = require('../../utils');
      StoreErrorHandler.handleError.mockReturnValue('Network connection failed');
      
      mockUserService.getUsers.mockRejectedValueOnce(networkError);
      mockUserService.getUserById.mockRejectedValueOnce(networkError);
      mockUserService.createUser.mockRejectedValueOnce(networkError);
      
      const { result } = renderHook(() => useUserStore());
      
      // Test fetchUsers
      await act(async () => {
        await result.current.fetchUsers();
      });
      expect(result.current.error).toBe('Network connection failed');
      expect(StoreErrorHandler.handleError).toHaveBeenCalledWith(networkError, 'Failed to load users');
      
      // Reset error
      act(() => {
        result.current.setError(null);
      });
      
      // Test fetchUserById
      await act(async () => {
        await result.current.fetchUserById(1);
      });
      expect(result.current.error).toBe('Network connection failed');
      expect(StoreErrorHandler.handleError).toHaveBeenCalledWith(networkError, 'Failed to load user');
      
      // Reset error
      act(() => {
        result.current.setError(null);
      });
      
      // Test createUser
      await act(async () => {
        await result.current.createUser({
          name: 'Test',
          username: 'test',
          email: 'test@example.com',
          phone: '123-456-7890',
          website: 'test.com',
          address: mockUsers[0].address,
          company: mockUsers[0].company
        });
      });
      expect(result.current.error).toBe('Network connection failed');
      expect(StoreErrorHandler.handleError).toHaveBeenCalledWith(networkError, 'Failed to create user');
    });
  });

  describe('State Transitions', () => {
    it('should handle complex state transitions correctly', async () => {
      const { result } = renderHook(() => useUserStore());
      
      // Initial state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      
      // Start async operation
      act(() => {
        result.current.setLoading(true);
        result.current.setError(null);
      });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      
      // Simulate error
      act(() => {
        result.current.setLoading(false);
        result.current.setError('Something went wrong');
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Something went wrong');
      
      // Clear error and try again
      act(() => {
        result.current.setError(null);
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      
      // Success
      act(() => {
        result.current.setUsers(mockUsers);
        result.current.setLoading(false);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.users).toEqual(mockUsers);
    });
  });
});
