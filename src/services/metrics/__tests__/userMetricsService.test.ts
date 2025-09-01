import { userMetricsService } from '../userMetricsService';
import type { User } from '../../../types';

describe('userMetricsService', () => {
  describe('processUserMetrics', () => {
    it('should handle empty user array', () => {
      const result = userMetricsService.processUserMetrics([]);
      
      expect(result).toEqual({
        totalUsers: 0,
        activeUsers: { count: 0, percentage: 0 },
        userGrowth: { newUsers: 0, growthRate: 0 },
        topCompany: { name: '', userCount: 0 }
      });
    });

    it('should process single user correctly', () => {
      const users: User[] = [
        {
          id: 1,
          name: 'John Doe',
          username: 'john',
          email: 'john@example.com',
          address: {
            street: '123 Main St',
            suite: 'Apt 1',
            city: 'Anytown',
            zipcode: '12345',
            geo: { lat: '40.7128', lng: '-74.0060' }
          },
          phone: '555-1234',
          website: 'john.com',
          company: {
            name: 'Test Corp',
            catchPhrase: 'Testing is fun',
            bs: 'test solutions'
          }
        }
      ];

      const result = userMetricsService.processUserMetrics(users);
      
      expect(result.totalUsers).toBe(1);
      expect(result.activeUsers.count).toBe(1);
      expect(result.activeUsers.percentage).toBe(100);
      expect(result.topCompany.name).toBe('Test Corp');
      expect(result.topCompany.userCount).toBe(1);
    });

    it('should calculate active users correctly', () => {
      const users: User[] = [
        { id: 1, name: 'User 1', username: 'user1', email: 'user1@test.com', 
          address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' }},
          phone: '', website: '', company: { name: 'Company A', catchPhrase: '', bs: '' }},
        { id: 2, name: 'User 2', username: 'user2', email: 'user2@test.com',
          address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' }},
          phone: '', website: '', company: { name: 'Company A', catchPhrase: '', bs: '' }},
        { id: 3, name: 'User 3', username: 'user3', email: 'user3@test.com',
          address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' }},
          phone: '', website: '', company: { name: 'Company B', catchPhrase: '', bs: '' }}
      ];

      const result = userMetricsService.processUserMetrics(users);
      
      expect(result.totalUsers).toBe(3);
      // Users with ID >= 3 (70% threshold) should be active
      expect(result.activeUsers.count).toBe(1);
      expect(result.activeUsers.percentage).toBe(33);
    });

    it('should identify top company by user count', () => {
      const users: User[] = [
        { id: 1, name: 'User 1', username: 'user1', email: 'user1@test.com',
          address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' }},
          phone: '', website: '', company: { name: 'Big Corp', catchPhrase: '', bs: '' }},
        { id: 2, name: 'User 2', username: 'user2', email: 'user2@test.com',
          address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' }},
          phone: '', website: '', company: { name: 'Big Corp', catchPhrase: '', bs: '' }},
        { id: 3, name: 'User 3', username: 'user3', email: 'user3@test.com',
          address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' }},
          phone: '', website: '', company: { name: 'Small Inc', catchPhrase: '', bs: '' }}
      ];

      const result = userMetricsService.processUserMetrics(users);
      
      expect(result.topCompany.name).toBe('Big Corp');
      expect(result.topCompany.userCount).toBe(2);
    });

    it('should handle users without companies', () => {
      const users: User[] = [
        { id: 1, name: 'User 1', username: 'user1', email: 'user1@test.com',
          address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' }},
          phone: '', website: '', company: { name: '', catchPhrase: '', bs: '' }}
      ];

      const result = userMetricsService.processUserMetrics(users);
      
      expect(result.totalUsers).toBe(1);
      expect(result.topCompany.name).toBe('');
      expect(result.topCompany.userCount).toBe(1);
    });
  });
});
