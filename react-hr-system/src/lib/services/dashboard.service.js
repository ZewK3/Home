// Dashboard Service
import { apiClient } from '../apiClient.js';

export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get personal statistics for an employee
  async getPersonalStats(employeeId) {
    try {
      const response = await apiClient.get('/dashboard/personal-stats', { employeeId });
      return response.data;
    } catch (error) {
      console.error('Get personal stats error:', error);
      throw error;
    }
  }
};