import type { User } from '../../types';
import { getNestedValue } from '../../utils';

/**
 * Performance optimization cache for user filtering and sorting
 * Uses memoization to avoid recomputation with identical inputs
 */
export class UserFilterCache {
  private static lastSearchTerm = '';
  private static lastSortField: string | null = null;
  private static lastSortOrder = '';
  private static lastUsers: User[] = [];
  private static cachedResult: User[] = [];

  static getFilteredAndSortedUsers(
    users: User[],
    searchTerm: string,
    sortField: string | null,
    sortOrder: 'asc' | 'desc'
  ): User[] {
    // Performance optimization: check if we can return cached result
    if (
      users === this.lastUsers &&
      searchTerm === this.lastSearchTerm &&
      sortField === this.lastSortField &&
      sortOrder === this.lastSortOrder
    ) {
      return this.cachedResult;
    }

    let result = users;

    // Filter optimization: early return if no search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = users.filter(user => this.userMatchesSearch(user, lowerSearchTerm));
    }

    // Sort optimization: early return if no sort field
    if (sortField) {
      result = [...result].sort((a, b) => this.compareUsers(a, b, sortField, sortOrder));
    }

    // Cache the result for future calls
    this.lastUsers = users;
    this.lastSearchTerm = searchTerm;
    this.lastSortField = sortField;
    this.lastSortOrder = sortOrder;
    this.cachedResult = result;

    return result;
  }

  private static userMatchesSearch(user: User, searchTerm: string): boolean {
    // Optimized search: check specific fields instead of JSON.stringify
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      user.phone.toLowerCase().includes(searchTerm) ||
      user.website.toLowerCase().includes(searchTerm) ||
      `${user.address.street} ${user.address.city}`.toLowerCase().includes(searchTerm) ||
      user.company.name.toLowerCase().includes(searchTerm)
    );
  }

  private static compareUsers(a: User, b: User, sortField: string, sortOrder: 'asc' | 'desc'): number {
    const aValue = getNestedValue(a, sortField);
    const bValue = getNestedValue(b, sortField);
    
    // Optimized comparison
    let comparison = 0;
    
    if (aValue == null && bValue == null) comparison = 0;
    else if (aValue == null) comparison = 1;
    else if (bValue == null) comparison = -1;
    else {
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      comparison = aStr.localeCompare(bStr);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  }

  // Clear cache when users array changes
  static clearCache(): void {
    this.lastUsers = [];
    this.cachedResult = [];
  }
}
