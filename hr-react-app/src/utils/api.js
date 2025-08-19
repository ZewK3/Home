// API utility functions
export const api = {
  // Base URL for API requests
  baseURL: '/api',

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('sessionToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
    register: (userData) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
    logout: () => api.request('/auth/logout', { method: 'POST' }),
    
    validateToken: () => api.request('/auth/validate'),
  },

  // Employee endpoints
  employees: {
    getAll: () => api.request('/employees'),
    getById: (id) => api.request(`/employees/${id}`),
    create: (data) => api.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => api.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/employees/${id}`, { method: 'DELETE' }),
  },

  // Attendance endpoints
  attendance: {
    checkIn: (data) => api.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    checkOut: (data) => api.request('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getHistory: (employeeId, params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/attendance/history/${employeeId}?${query}`);
    },
  },

  // Tasks endpoints
  tasks: {
    getAll: () => api.request('/tasks'),
    getById: (id) => api.request(`/tasks/${id}`),
    create: (data) => api.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => api.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/tasks/${id}`, { method: 'DELETE' }),
  },
};

export default api;