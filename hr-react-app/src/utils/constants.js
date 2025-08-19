// Application constants
export const APP_CONFIG = {
  name: 'HR Management System',
  version: '1.0.0',
  author: 'ZewK3',
  description: 'Professional HR Management System with modern React architecture',
};

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  retryAttempts: 3,
};

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'AD',
  ASSISTANT_MANAGER: 'AM',
  MANAGER: 'QL',
  EMPLOYEE: 'NV',
};

// Employee Position Levels
export const POSITION_LEVELS = {
  LV1: 'LV1',
  LV2: 'LV2',
  LV3: 'LV3',
  LV4: 'LV4',
  LV5: 'LV5',
};

// Employee Ranks
export const EMPLOYEE_RANKS = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  DIAMOND: 'Kim Cương',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  LATE: 'late',
  ABSENT: 'absent',
  ON_LEAVE: 'on_leave',
};

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
};

// Request Types
export const REQUEST_TYPES = {
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  SICK_LEAVE: 'sick_leave',
  PERSONAL_LEAVE: 'personal_leave',
  VACATION: 'vacation',
  TASK_ASSIGNMENT: 'task_assignment',
  SHIFT_CHANGE: 'shift_change',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'currentUser',
  TOKEN: 'sessionToken',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'userSettings',
  ATTENDANCE_CACHE: 'attendanceCache',
  TASK_CACHE: 'taskCache',
};

// GPS Configuration
export const GPS_CONFIG = {
  accuracy: 10, // meters
  timeout: 15000, // milliseconds
  maximumAge: 300000, // 5 minutes
  defaultRadius: 100, // meters for store proximity
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME_DISPLAY: 'DD/MM/YYYY HH:mm',
  DATETIME_API: 'YYYY-MM-DD HH:mm:ss',
  TIME_ONLY: 'HH:mm',
};

// Language Configuration
export const LANGUAGES = {
  VI: {
    code: 'vi',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
  },
  EN: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  },
};

// Navigation Menu Items
export const MENU_ITEMS = {
  DASHBOARD: 'dashboard',
  ATTENDANCE: 'attendance',
  TASKS: 'tasks',
  EMPLOYEES: 'employees',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  PERSONAL: 'personal',
};

// File Upload Configuration
export const FILE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
};

// Validation Rules
export const VALIDATION_RULES = {
  password: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
  phone: {
    pattern: /^[0-9]{10,11}$/,
    message: 'Số điện thoại phải có 10-11 chữ số',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  FORBIDDEN: 'Truy cập bị từ chối',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  SERVER_ERROR: 'Lỗi máy chủ',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  GPS_ERROR: 'Không thể xác định vị trí GPS',
  LOCATION_DENIED: 'Quyền truy cập vị trí bị từ chối',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  SAVE_SUCCESS: 'Lưu dữ liệu thành công',
  DELETE_SUCCESS: 'Xóa dữ liệu thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  CHECKIN_SUCCESS: 'Chấm công vào thành công',
  CHECKOUT_SUCCESS: 'Chấm công ra thành công',
};

export default {
  APP_CONFIG,
  API_CONFIG,
  THEMES,
  USER_ROLES,
  POSITION_LEVELS,
  EMPLOYEE_RANKS,
  ATTENDANCE_STATUS,
  TASK_STATUS,
  REQUEST_TYPES,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  GPS_CONFIG,
  DATE_FORMATS,
  LANGUAGES,
  MENU_ITEMS,
  FILE_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};