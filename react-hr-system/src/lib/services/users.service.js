// Users Service
import { apiClient } from '../apiClient.js';

export const usersService = {
  // Get all users with optional filtering
  async list(params = {}) {
    try {
      const response = await apiClient.get('/users', params);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Get user by ID
  async getById(employeeId) {
    try {
      const response = await apiClient.get(`/users/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Update user information
  async update(employeeId, userData) {
    try {
      const response = await apiClient.put(`/users/${employeeId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Update user permissions
  async updatePermissions(employeeId, permissions) {
    try {
      const response = await apiClient.put(`/users/${employeeId}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error('Update permissions error:', error);
      throw error;
    }
  },

  // Get user history
  async getHistory(employeeId) {
    try {
      const response = await apiClient.get(`/users/${employeeId}/history`);
      return response.data;
    } catch (error) {
      console.error('Get user history error:', error);
      throw error;
    }
  }
};