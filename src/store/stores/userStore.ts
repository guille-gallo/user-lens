import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../types';
import { dataService } from '../../services';
import { UserFilterCache, StoreErrorHandler } from '../utils';

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortField: string | null;
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setUsers: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (searchTerm: string) => void;
  setSorting: (field: string, order: 'asc' | 'desc') => void;
  
  // Async actions
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  
  // Computed values
  getFilteredAndSortedUsers: () => User[];
}

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

      setUsers: (users) => {
        UserFilterCache.clearCache(); // Clear cache when users change
        set({ users });
      },
      setSelectedUser: (user) => set({ selectedUser: user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSorting: (field, order) => set({ sortField: field, sortOrder: order }),

      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          const users = await dataService.getUsers();
          UserFilterCache.clearCache();
          set({ users, loading: false });
        } catch (error) {
          const errorMessage = StoreErrorHandler.handleError(error, 'Failed to load users');
          set({ error: errorMessage, loading: false });
        }
      },

      fetchUserById: async (id) => {
        set({ loading: true, error: null });
        try {
          const user = await dataService.getUserById(id);
          set({ selectedUser: user, loading: false });
        } catch (error) {
          const errorMessage = StoreErrorHandler.handleError(error, 'Failed to load user');
          set({ error: errorMessage, loading: false });
        }
      },

      createUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          const newUser = await dataService.createUser(userData);
          const currentUsers = get().users;
          UserFilterCache.clearCache();
          set({ users: [...currentUsers, newUser], loading: false });
        } catch (error) {
          const errorMessage = StoreErrorHandler.handleError(error, 'Failed to create user');
          set({ error: errorMessage, loading: false });
        }
      },

      updateUser: async (id, userData) => {
        set({ loading: true, error: null });
        try {
          const updatedUser = await dataService.updateUser(id, userData);
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
          await dataService.deleteUser(id);
          
          const filteredUsers = currentUsers.filter(user => user.id !== id);
          UserFilterCache.clearCache();
          set({ users: filteredUsers, loading: false });

          if (selectedUser && selectedUser.id === id) {
            set({ selectedUser: null });
          }
        } catch (error) {
          const errorMessage = `Failed to delete ${userToDelete?.name || 'user'}: ${StoreErrorHandler.handleError(error, 'Unknown error')}`;
          set({ error: errorMessage, loading: false });
        }
      },

      getFilteredAndSortedUsers: () => {
        const { users, searchTerm, sortField, sortOrder } = get();
        return UserFilterCache.getFilteredAndSortedUsers(users, searchTerm, sortField, sortOrder);
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        users: state.users,
        searchTerm: state.searchTerm,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
      }),
    }
  )
);

