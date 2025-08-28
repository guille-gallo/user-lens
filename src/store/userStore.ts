import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../services/userService';
import { userService } from '../services/userService';

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortField: keyof User | null;
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setUsers: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (searchTerm: string) => void;
  setSorting: (field: keyof User, order: 'asc' | 'desc') => void;
  
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
          const users = await userService.getUsers();
          set({ users, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      fetchUserById: async (id) => {
        set({ loading: true, error: null });
        try {
          const user = await userService.getUserById(id);
          set({ selectedUser: user, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      createUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          const newUser = await userService.createUser(userData);
          const currentUsers = get().users;
          const newId = Math.max(...currentUsers.map(u => u.id), 0) + 1;
          const userWithId = { ...newUser, id: newId };
          set({ users: [...currentUsers, userWithId], loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
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
        // Optimistic update - remove user immediately from UI
        const currentUsers = get().users;
        const userToDelete = currentUsers.find(user => user.id === id);
        const filteredUsers = currentUsers.filter(user => user.id !== id);
        
        // Update UI immediately for better UX
        set({ users: filteredUsers });

        const selectedUser = get().selectedUser;
        if (selectedUser && selectedUser.id === id) {
          set({ selectedUser: null });
        }

        try {
          await userService.deleteUser(id);
        } catch (error) {
          // rollback the optimistic update on error
          set({ 
            users: currentUsers, 
            error: `Failed to delete ${userToDelete?.name || 'user'}: ${(error as Error).message}`,
            selectedUser: selectedUser // restore selected user if it was the deleted one
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
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];
            
            // Handle nested properties (like company.name)
            if (sortField === 'company' && typeof aValue === 'object' && typeof bValue === 'object') {
              aValue = aValue.name;
              bValue = bValue.name;
            }
            
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

