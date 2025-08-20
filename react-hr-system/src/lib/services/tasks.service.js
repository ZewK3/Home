// Task Management Service
import { apiClient } from '../apiClient.js';

export const taskService = {
  // Get tasks with filters
  async getTasks(params = {}) {
    try {
      const response = await apiClient.get('/tasks', params);
      return response.data || [];
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },

  // Create a new task
  async createTask(taskData) {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  // Approve a task
  async approveTask(taskId, comments = '') {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/approve`, { comments });
      return response.data;
    } catch (error) {
      console.error('Approve task error:', error);
      throw error;
    }
  },

  // Reject a task
  async rejectTask(taskId, reason = '') {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject task error:', error);
      throw error;
    }
  }
};