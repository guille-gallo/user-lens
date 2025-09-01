import type { User, UserMetrics, UserMetricsSummary } from '../../types';

/**
 * User Metrics Service
 * Processes user data to generate analytics and insights
 */

export const userMetricsService = {
  // Process user data to create metrics summary
  processUserMetrics: (users: User[]): UserMetricsSummary => {
    if (!users.length) {
      return {
        totalUsers: 0,
        activeUsers: { count: 0, percentage: 0 },
        userGrowth: { newUsers: 0, growthRate: 0 },
        topCompany: { name: '', userCount: 0 }
      };
    }

    const totalUsers = users.length;

    // Simulate active users based on user ID pattern (higher IDs = more recent/active)
    // This simulates real-world scenario where recent users are more likely to be active
    const recentThreshold = Math.max(1, Math.ceil(totalUsers * 0.7)); // 70% threshold
    const activeUsers = users.filter(user => user.id >= recentThreshold).length;
    const activeUsersPercentage = Math.round((activeUsers / totalUsers) * 100);

    // Simulate new users (users with higher IDs are "newer")
    const newUsersThreshold = Math.max(1, Math.ceil(totalUsers * 0.8)); // 80% threshold
    const newUsers = users.filter(user => user.id >= newUsersThreshold).length;
    
    // Calculate growth rate based on new vs existing users
    const existingUsers = totalUsers - newUsers;
    const growthRate = existingUsers > 0 ? Math.round((newUsers / existingUsers) * 100) : 100;

    // Find company with most users
    const companyUserCounts = users.reduce((acc, user) => {
      const companyName = user.company.name;
      acc[companyName] = (acc[companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to entries and find top company with proper typing
    const companyData = Object.entries(companyUserCounts);
    const topCompanyEntry = companyData.reduce(
      (max: [string, number], [company, count]: [string, number]) => 
        count > max[1] ? [company, count] : max,
      ['', 0] as [string, number]
    );

    return {
      totalUsers,
      activeUsers: {
        count: activeUsers,
        percentage: activeUsersPercentage
      },
      userGrowth: {
        newUsers,
        growthRate
      },
      topCompany: {
        name: topCompanyEntry[0],
        userCount: topCompanyEntry[1]
      }
    };
  },

  // Additional utility to get detailed metrics if needed
  getDetailedMetrics: (users: User[]): UserMetrics => {
    if (!users.length) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        activeUsersPercentage: 0,
        newUsersThisMonth: 0,
        userGrowthRate: 0,
        averageUsersPerCompany: 0,
        topCompanyByUsers: { name: '', userCount: 0 }
      };
    }

    const summary = userMetricsService.processUserMetrics(users);
    
    // Calculate additional metrics
    const uniqueCompanies = new Set(users.map(user => user.company.name)).size;
    const averageUsersPerCompany = Math.round(users.length / uniqueCompanies);

    return {
      totalUsers: summary.totalUsers,
      activeUsers: summary.activeUsers.count,
      activeUsersPercentage: summary.activeUsers.percentage,
      newUsersThisMonth: summary.userGrowth.newUsers,
      userGrowthRate: summary.userGrowth.growthRate,
      averageUsersPerCompany,
      topCompanyByUsers: summary.topCompany
    };
  }
};
