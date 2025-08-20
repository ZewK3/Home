// Registration/Queue Management Service
import { apiClient } from '../apiClient.js';

export const registrationService = {
  // Get pending registrations (filtered by role)
  async getPending(params = {}) {
    try {
      const response = await apiClient.get('/registrations/pending', params);
      return response.data || [];
    } catch (error) {
      console.error('Get pending registrations error:', error);
      throw error;
    }
  },

  // Approve a registration
  async approve(employeeId) {
    try {
      const response = await apiClient.post('/registrations/approve', { employeeId });
      return response.data;
    } catch (error) {
      console.error('Approve registration error:', error);
      throw error;
    }
  },

  // Reject a registration
  async reject(employeeId, reason = '') {
    try {
      const response = await apiClient.post('/registrations/reject', { 
        employeeId, 
        reason 
      });
      return response.data;
    } catch (error) {
      console.error('Reject registration error:', error);
      throw error;
    }
  }
};