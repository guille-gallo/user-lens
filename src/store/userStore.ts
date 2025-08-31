import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../services/userService';
import { dataService } from '../services/dataService';

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

      setUsers: (users) => set({ users }),
      setSelectedUser: (user) => set({ selectedUser: user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setSorting: (field, order) => set({ sortField: field, sortOrder: order }),

      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          const users = await dataService.getUsers();
          set({ users, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchUserById: async (id) => {
        set({ loading: true, error: null });
        try {
          const user = await dataService.getUserById(id);
          set({ selectedUser: user, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      createUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          const newUser = await dataService.createUser(userData);
          const currentUsers = get().users;
          // Use the user exactly as returned from dataService (with correct ID)
          set({ users: [...currentUsers, newUser], loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
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
          set({ users: updatedUsers, loading: false });
          
          const selectedUser = get().selectedUser;
          if (selectedUser && selectedUser.id === id) {
            set({ selectedUser: { ...selectedUser, ...updatedUser } });
          }
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      deleteUser: async (id) => {
        set({ loading: true, error: null });
        
        // Store references for potential rollback
        const currentUsers = get().users;
        const userToDelete = currentUsers.find(user => user.id === id);
        const selectedUser = get().selectedUser;

        try {
          await dataService.deleteUser(id);
          
          // Only update UI after successful deletion
          const filteredUsers = currentUsers.filter(user => user.id !== id);
          set({ users: filteredUsers, loading: false });

          if (selectedUser && selectedUser.id === id) {
            set({ selectedUser: null });
          }
        } catch (error) {
          set({ 
            error: `Failed to delete ${userToDelete?.name || 'user'}: ${(error as Error).message}`,
            loading: false
          });
        }
      },

      getFilteredAndSortedUsers: () => {
        const { users, searchTerm, sortField, sortOrder } = get();
        let filteredUsers = users;

        // filter by search term
        if (searchTerm) {
          filteredUsers = users.filter(user =>
            Object.values(user).some(value => {
              if (typeof value === 'string') {
                return value.toLowerCase().includes(searchTerm.toLowerCase());
              }
              if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
              }
              return false;
            })
          );
        }

        // sort
        if (sortField) {
          filteredUsers.sort((a, b) => {
            // helper function to get nested value
            const getValue = (obj: any, path: string) => {
              const keys = path.split('.');
              let value = obj;
              for (const key of keys) {
                value = value?.[key];
              }
              return value;
            };

            let aValue = getValue(a, sortField);
            let bValue = getValue(b, sortField);
            
            // Convert to lowercase for string comparison
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
            
            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;
            
            return sortOrder === 'asc' ? comparison : -comparison;
          });
        }

        return filteredUsers;
      },
    }),
    {
      name: 'user-store', // storage key
      partialize: (state) => ({
        users: state.users, // persist users
        searchTerm: state.searchTerm,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
      }), // persist data and UI state
    }
  )
);

