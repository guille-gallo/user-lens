// todo: move to types file.
// interface based on JSONPlaceholder API structure
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// TODO: move to constants.
const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const userService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user with ID ${id}`);
    }
    return response.json();
  },

  // Create
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  },

  // Update
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update user with ID ${id}`);
    }
    return response.json();
  },

  // Delete
  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  },
};
