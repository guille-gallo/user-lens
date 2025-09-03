import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PaginationParams, PaginatedResponse } from '../../types';
import { userService } from '../../services/api/userService';
import { UserFilterCache, StoreErrorHandler } from '../utils';

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortField: string | null;
  sortOrder: 'asc' | 'desc';
  lastFetch: number; // Timestamp of last fetch
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Actions
  setUsers: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (searchTerm: string) => void;
  setSorting: (field: string, order: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setPaginationData: (paginatedResponse: PaginatedResponse<User>) => void;
  
  // Async actions
  fetchUsers: (params?: Partial<PaginationParams>, force?: boolean, signal?: AbortSignal) => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  
  // Navigation actions
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  
  // Computed values
  getFilteredAndSortedUsers: (searchTerm?: string) => User[];
}

// Cache duration for users (10 minutes)
const USER_CACHE_DURATION = 10 * 60 * 1000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      selectedUser: null,
      loading: false,
      error: null,
      searchTerm: '',
      sortField: null,
      sortOrder: 'asc',
      lastFetch: 0,
      
      // Pagination state
      currentPage: 1,
      pageSize: 20,
      totalUsers: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,

      setUsers: (users) => {
        UserFilterCache.clearCache(); // Clear cache when users change
        set({ users, lastFetch: Date.now() });
      },
      setSelectedUser: (user) => set({ selectedUser: user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSorting: (field, order) => set({ sortField: field, sortOrder: order }),
      setPage: (page) => set({ currentPage: page }),
      setPageSize: (size) => set({ pageSize: size, currentPage: 1 }), // Reset to first page when changing size
      setPaginationData: (paginatedResponse) => {
        const { data, pagination } = paginatedResponse;
        UserFilterCache.clearCache();
        set({
          users: data,
          currentPage: pagination.page,
          totalUsers: pagination.total,
          totalPages: pagination.totalPages,
          hasNextPage: pagination.hasNext,
          hasPrevPage: pagination.hasPrev,
          lastFetch: Date.now(),
        });
      },

      fetchUsers: async (params = {}, force = false, signal?: AbortSignal) => {
        const state = get();
        const { lastFetch, loading, currentPage, pageSize, searchTerm, sortField, sortOrder } = state;
        
        // Build the request parameters
        const requestParams: PaginationParams = {
          page: params.page || currentPage,
          limit: params.limit || pageSize,
          searchTerm: params.searchTerm !== undefined ? params.searchTerm : searchTerm,
          sortField: params.sortField || sortField || undefined,
          sortOrder: params.sortOrder || sortOrder,
        };
        
        // Skip if currently loading the same request (prevent duplicate calls)
        if (loading && !force) {
          return;
        }
        
        // For non-forced requests, check if we have recent data for the same parameters
        const now = Date.now();
        const isSameRequest = 
          requestParams.page === currentPage && 
          requestParams.limit === pageSize &&
          requestParams.searchTerm === searchTerm &&
          requestParams.sortField === sortField &&
          requestParams.sortOrder === sortOrder;
          
        if (!force && isSameRequest && (now - lastFetch < USER_CACHE_DURATION)) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const paginatedResponse = await userService.getUsers(requestParams, signal);
          get().setPaginationData(paginatedResponse);
          set({ loading: false });
        } catch (error) {
          // Don't show error for aborted requests
          if (signal?.aborted) {
            set({ loading: false });
            return;
          }
          const errorMessage = StoreErrorHandler.handleError(error, 'Failed to load users');
          set({ error: errorMessage, loading: false });
        }
      },

      goToNextPage: async () => {
        const { hasNextPage, currentPage } = get();
        if (hasNextPage) {
          await get().fetchUsers({ page: currentPage + 1 }, true);
        }
      },

      goToPrevPage: async () => {
        const { hasPrevPage, currentPage } = get();
        if (hasPrevPage) {
          await get().fetchUsers({ page: currentPage - 1 }, true);
        }
      },

      goToPage: async (page: number) => {
        const { totalPages } = get();
        if (page >= 1 && page <= totalPages) {
          await get().fetchUsers({ page }, true);
        }
      },

      fetchUserById: async (id) => {
        set({ loading: true, error: null });
        try {
          const user = await userService.getUserById(id);
          set({ selectedUser: user, loading: false });
        } catch (error) {
          const errorMessage = StoreErrorHandler.handleError(error, 'Failed to load user');
          set({ error: errorMessage, loading: false });
        }
      },

      createUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          await userService.createUser(userData);
          // Refresh current page to show the new user
          await get().fetchUsers({}, true);
          set({ loading: false });
        } catch (error) {
          const errorMessage = StoreErrorHandler.handleError(error, 'Failed to create user');
          set({ error: errorMessage, loading: false });
        }
      },

      updateUser: async (id, userData) => {
        set({ loading: true, error: null });
        try {
          const updatedUser = await userService.updateUser(id, userData);
          const currentUsers = get().users;
          const updatedUsers = currentUsers.map(user => 
            user.id === id ? { ...user, ...updatedUser } : user
          );
          UserFilterCache.clearCache();
          set({ users: updatedUsers, loading: false });
          
          const selectedUser = get().selectedUser;
          if (selectedUser && selectedUser.id === id) {
            set({ selectedUser: { ...selectedUser, ...updatedUser } });
          }
        } catch (error) {
          const errorMessage = StoreErrorHandler.handleError(error, 'Failed to update user');
          set({ error: errorMessage, loading: false });
        }
      },

      deleteUser: async (id) => {
        set({ loading: true, error: null });
        
        const currentUsers = get().users;
        const userToDelete = currentUsers.find(user => user.id === id);
        const selectedUser = get().selectedUser;

        try {
          await userService.deleteUser(id);
          
          // Refresh current page after deletion
          await get().fetchUsers({}, true);
          
          if (selectedUser && selectedUser.id === id) {
            set({ selectedUser: null });
          }
          set({ loading: false });
        } catch (error) {
          const errorMessage = `Failed to delete ${userToDelete?.name || 'user'}: ${StoreErrorHandler.handleError(error, 'Unknown error')}`;
          set({ error: errorMessage, loading: false });
        }
      },

      getFilteredAndSortedUsers: (customSearchTerm?: string) => {
        const { users, searchTerm, sortField, sortOrder } = get();
        const term = customSearchTerm !== undefined ? customSearchTerm : searchTerm;
        return UserFilterCache.getFilteredAndSortedUsers(users, term, sortField, sortOrder);
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        users: state.users,
        searchTerm: state.searchTerm,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
        lastFetch: state.lastFetch,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        totalUsers: state.totalUsers,
        totalPages: state.totalPages,
        hasNextPage: state.hasNextPage,
        hasPrevPage: state.hasPrevPage,
      }),
    }
  )
);

