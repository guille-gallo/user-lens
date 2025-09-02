import { userService } from '../userService';
import type { User } from '../../../types';

// Mock fetch for testing
global.fetch = jest.fn();

// Create a Response constructor for Node.js environment
const MockResponseConstructor = function(this: any, body: string, init: ResponseInit = {}) {
  this.bodyContent = body;
  this.init = init;
  
  // Make this instance pass instanceof Response checks
  Object.setPrototypeOf(this, MockResponseConstructor.prototype);
} as any;

// Add methods to the prototype
MockResponseConstructor.prototype.json = function() {
  return Promise.resolve(JSON.parse(this.bodyContent));
};

MockResponseConstructor.prototype.text = function() {
  return Promise.resolve(this.bodyContent);
};

Object.defineProperty(MockResponseConstructor.prototype, 'status', {
  get: function() {
    return this.init.status || 200;
  }
});

Object.defineProperty(MockResponseConstructor.prototype, 'ok', {
  get: function() {
    return this.status >= 200 && this.status < 300;
  }
});

Object.defineProperty(MockResponseConstructor.prototype, 'statusText', {
  get: function() {
    return this.init.statusText || 'OK';
  }
});

// Set up the global Response constructor
global.Response = MockResponseConstructor as any;

// Helper function to create mock responses
const createMockResponse = (body: string, init: ResponseInit = {}) => {
  return new (global.Response as any)(body, init);
};

// Test data
const mockUser: User = {
  id: 1,
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  address: {
    street: '123 Main St',
    suite: 'Apt 1',
    city: 'Anytown',
    zipcode: '12345',
    geo: {
      lat: '40.7128',
      lng: '-74.0060'
    }
  },
  phone: '555-1234',
  website: 'johndoe.com',
  company: {
    name: 'Test Corp',
    catchPhrase: 'Testing is our business',
    bs: 'innovative test solutions'
  }
};

const mockUsers: User[] = [
  mockUser,
  {
    ...mockUser,
    id: 2,
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com'
  }
];

const mockCreateUserData: Omit<User, 'id'> = {
  name: 'New User',
  username: 'newuser',
  email: 'new@example.com',
  address: {
    street: '456 New St',
    suite: 'Suite 2',
    city: 'New City',
    zipcode: '54321',
    geo: {
      lat: '41.8781',
      lng: '-87.6298'
    }
  },
  phone: '555-5678',
  website: 'newuser.com',
  company: {
    name: 'New Corp',
    catchPhrase: 'Innovation at its finest',
    bs: 'cutting-edge solutions'
  }
};

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockResponse = createMockResponse(JSON.stringify(mockUsers), { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.getUsers();

      expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users', {});
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should handle empty user list', async () => {
      const mockResponse = createMockResponse('[]', { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.getUsers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when API returns error', async () => {
      const mockResponse = createMockResponse('{}', { status: 500, statusText: 'Internal Server Error' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.getUsers()).rejects.toThrow(Error);
      await expect(userService.getUsers()).rejects.toThrow('GET /users failed:');
      await expect(userService.getUsers()).rejects.toThrow('Internal Server Error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(userService.getUsers()).rejects.toThrow('GET /users failed: Network error');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID successfully', async () => {
      const mockResponse = createMockResponse(JSON.stringify(mockUser), { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.getUserById(1);

      expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users/1', {});
      expect(result).toEqual(mockUser);
      expect(result.id).toBe(1);
    });

    it('should handle user not found', async () => {
      const mockResponse = createMockResponse('{}', { status: 404, statusText: 'Not Found' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.getUserById(999)).rejects.toThrow(Error);
      await expect(userService.getUserById(999)).rejects.toThrow('GET /users/999 failed:');
      await expect(userService.getUserById(999)).rejects.toThrow('Not Found');
    });

    it('should handle invalid user ID', async () => {
      const mockResponse = createMockResponse('{}', { status: 400, statusText: 'Bad Request' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.getUserById(-1)).rejects.toThrow(Error);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createdUser = { ...mockCreateUserData, id: 3 };
      const mockResponse = createMockResponse(JSON.stringify(createdUser), { status: 201 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.createUser(mockCreateUserData);

      expect(fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(mockCreateUserData)
        })
      );
      expect(result).toEqual(createdUser);
      expect(result.id).toBe(3);
    });

    it('should handle validation errors', async () => {
      const mockResponse = createMockResponse('{}', { status: 400, statusText: 'Bad Request' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const invalidUserData = { ...mockCreateUserData, email: 'invalid-email' };

      await expect(userService.createUser(invalidUserData)).rejects.toThrow(Error);
      await expect(userService.createUser(invalidUserData)).rejects.toThrow('POST /users failed:');
      await expect(userService.createUser(invalidUserData)).rejects.toThrow('Bad Request');
    });

    it('should handle server errors during creation', async () => {
      const mockResponse = createMockResponse('{}', { status: 500, statusText: 'Internal Server Error' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.createUser(mockCreateUserData)).rejects.toThrow(Error);
    });
  });

  describe('updateUser', () => {
    const updateData: Partial<User> = {
      name: 'Updated Name',
      email: 'updated@example.com'
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      const mockResponse = createMockResponse(JSON.stringify(updatedUser), { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.updateUser(1, updateData);

      expect(fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updateData)
        })
      );
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
    });

    it('should handle user not found during update', async () => {
      const mockResponse = createMockResponse('{}', { status: 404, statusText: 'Not Found' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.updateUser(999, updateData)).rejects.toThrow(Error);
      await expect(userService.updateUser(999, updateData)).rejects.toThrow('PUT /users/999 failed:');
      await expect(userService.updateUser(999, updateData)).rejects.toThrow('Not Found');
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: 'Only Name Changed' };
      const updatedUser = { ...mockUser, ...partialUpdate };
      const mockResponse = createMockResponse(JSON.stringify(updatedUser), { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.updateUser(1, partialUpdate);

      expect(result.name).toBe('Only Name Changed');
      expect(result.email).toBe(mockUser.email); // Should retain original email
    });

    it('should handle empty update data', async () => {
      const mockResponse = createMockResponse(JSON.stringify(mockUser), { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.updateUser(1, {});

      expect(fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users/1',
        expect.objectContaining({
          body: JSON.stringify({})
        })
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse = createMockResponse('', { status: 204 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.deleteUser(1)).resolves.toBeUndefined();

      expect(fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should handle user not found during deletion', async () => {
      const mockResponse = createMockResponse('{}', { status: 404, statusText: 'Not Found' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.deleteUser(999)).rejects.toThrow(Error);
      await expect(userService.deleteUser(999)).rejects.toThrow('DELETE /users/999 failed:');
      await expect(userService.deleteUser(999)).rejects.toThrow('Not Found');
    });

    it('should handle server errors during deletion', async () => {
      const mockResponse = createMockResponse('{}', { status: 500, statusText: 'Internal Server Error' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.deleteUser(1)).rejects.toThrow(Error);
    });

    it('should handle forbidden deletion', async () => {
      const mockResponse = createMockResponse('{}', { status: 403, statusText: 'Forbidden' });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.deleteUser(1)).rejects.toThrow(Error);
      await expect(userService.deleteUser(1)).rejects.toThrow('DELETE /users/1 failed:');
      await expect(userService.deleteUser(1)).rejects.toThrow('Forbidden');
    });
  });

  describe('Service Instance', () => {
    it('should export a singleton instance', () => {
      expect(userService).toBeDefined();
      expect(typeof userService.getUsers).toBe('function');
      expect(typeof userService.getUserById).toBe('function');
      expect(typeof userService.createUser).toBe('function');
      expect(typeof userService.updateUser).toBe('function');
      expect(typeof userService.deleteUser).toBe('function');
    });

    it('should use correct base URL', () => {
      // Access the baseUrl through the service (it's protected, but we can test indirectly)
      expect(fetch).not.toHaveBeenCalled();
      
      // This will trigger a call and we can verify the URL
      const mockResponse = createMockResponse('[]', { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      userService.getUsers();
      
      expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users', {});
    });
  });
});
