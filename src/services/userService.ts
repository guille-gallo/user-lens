// todo: move to types file.
// interface based on JSONPlaceholder structure
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

// Add timeout to all API calls
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    const response = await fetchWithTimeout(`${BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await fetchWithTimeout(`${BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  // Create user
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await fetchWithTimeout(`${BASE_URL}/users`, {
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

  // Update user
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await fetchWithTimeout(`${BASE_URL}/users/${id}`, {
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

  // Delete user
  async deleteUser(id: number): Promise<void> {
    const response = await fetchWithTimeout(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  },
};
