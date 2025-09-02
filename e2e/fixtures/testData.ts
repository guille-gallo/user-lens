/**
 * Test fixtures for consistent test data
 * Senior-level approach: Type-safe, reusable test data
 */

export interface TestUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface TestNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export const testUsers: TestUser[] = [
  {
    id: '1',
    name: 'Leanne Graham',
    email: 'Sincere@april.biz',
    phone: '1-770-736-8031 x56442'
  },
  {
    id: '2',
    name: 'Ervin Howell',
    email: 'Shanna@melissa.tv',
    phone: '010-692-6593 x09125'
  },
  {
    id: '3',
    name: 'Clementine Bauch',
    email: 'Nathan@yesenia.net',
    phone: '1-463-123-4447'
  },
  {
    id: '4',
    name: 'Patricia Lebsack',
    email: 'Julianne.OConner@kory.org',
    phone: '493-170-9623 x156'
  }
];

export const testNotifications: TestNotification[] = [
  {
    id: '1',
    message: 'New user registered: John Doe',
    type: 'info',
    read: false,
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    message: 'User profile updated successfully',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 60000).toISOString() // 1 minute ago
  },
  {
    id: '3',
    message: 'Warning: Low storage space',
    type: 'warning',
    read: true,
    timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
  }
];

/**
 * Factory functions for creating test data
 */
export class TestDataFactory {
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const id = Date.now().toString();
    return {
      id,
      name: `Test User ${id}`,
      email: `test.user.${id}@example.com`,
      phone: `+1 (555) ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      avatar: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
      ...overrides
    };
  }

  static createNotification(overrides: Partial<TestNotification> = {}): TestNotification {
    const id = Date.now().toString();
    return {
      id,
      message: `Test notification ${id}`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString(),
      ...overrides
    };
  }

  static createMultipleUsers(count: number): TestUser[] {
    return Array.from({ length: count }, (_, index) => 
      this.createUser({ 
        id: (index + 1).toString(),
        name: `Test User ${index + 1}` 
      })
    );
  }
}

/**
 * Expected test scenarios data
 */
export const testScenarios = {
  userSearch: {
    query: 'Leanne',
    expectedResultsCount: 1,
    expectedUser: testUsers[0]
  },
  userEdit: {
    originalUser: testUsers[0],
    updatedData: {
      name: 'Leanne Graham Updated',
      email: 'leanne.graham.updated@example.com',
      phone: '1-770-736-8031 x99999'
    }
  },
  emptySearch: {
    query: 'nonexistentuser',
    expectedResultsCount: 0
  }
};
