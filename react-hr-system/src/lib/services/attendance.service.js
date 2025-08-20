// Attendance & Shift Management Service
import { apiClient } from '../apiClient.js';

export const attendanceService = {
  // Get shift assignments
  async getShiftAssignments(params = {}) {
    try {
      const response = await apiClient.get('/shifts/assignments', params);
      return response.data || [];
    } catch (error) {
      console.error('Get shift assignments error:', error);
      throw error;
    }
  },

  // Save shift assignment
  async saveShiftAssignment(assignmentData) {
    try {
      const response = await apiClient.post('/shifts/assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Save shift assignment error:', error);
      throw error;
    }
  },

  // Get current shift
  async getCurrentShift(employeeId = '') {
    try {
      const params = employeeId ? { employeeId } : {};
      const response = await apiClient.get('/shifts/current', params);
      return response.data;
    } catch (error) {
      console.error('Get current shift error:', error);
      throw error;
    }
  },

  // Get weekly schedule
  async getWeeklySchedule(employeeId = '') {
    try {
      const params = employeeId ? { employeeId } : {};
      const response = await apiClient.get('/shifts/weekly', params);
      return response.data || [];
    } catch (error) {
      console.error('Get weekly schedule error:', error);
      throw error;
    }
  },

  // Get timesheet
  async getTimesheet(params = {}) {
    try {
      const response = await apiClient.get('/attendance/timesheet', params);
      return response.data || [];
    } catch (error) {
      console.error('Get timesheet error:', error);
      throw error;
    }
  },

  // Get attendance history
  async getHistory(params = {}) {
    try {
      const response = await apiClient.get('/attendance/history', params);
      return response.data || [];
    } catch (error) {
      console.error('Get attendance history error:', error);
      throw error;
    }
  },

  // Check in
  async checkIn(locationData) {
    try {
      const response = await apiClient.post('/attendance/check-in', locationData);
      return response.data;
    } catch (error) {
      console.error('Check in error:', error);
      throw error;
    }
  },

  // Check out
  async checkOut(locationData) {
    try {
      const response = await apiClient.post('/attendance/check-out', locationData);
      return response.data;
    } catch (error) {
      console.error('Check out error:', error);
      throw error;
    }
  },

  // Submit attendance request
  async submitRequest(requestData) {
    try {
      const response = await apiClient.post('/attendance/requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Submit attendance request error:', error);
      throw error;
    }
  }
};