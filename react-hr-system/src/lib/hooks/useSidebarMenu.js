import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

// Fallback menu when API fails or user has no role
const FALLBACK_MENU = [
  {
    id: 'dashboard',
    icon: 'dashboard',
    title: 'Trang chủ',
    path: '/dashboard',
    roles: ['AD', 'QL', 'AM', 'NV']
  },
  {
    id: 'personal',
    icon: 'person',
    title: 'Thông tin cá nhân',
    path: '/profile',
    roles: ['AD', 'QL', 'AM', 'NV']
  },
  {
    id: 'logout',
    icon: 'logout',
    title: 'Đăng xuất',
    action: 'logout',
    roles: ['AD', 'QL', 'AM', 'NV']
  }
];

// Full menu based on user role
const FULL_MENU = [
  {
    id: 'dashboard',
    icon: 'dashboard',
    title: 'Trang chủ',
    path: '/dashboard',
    roles: ['AD', 'QL', 'AM', 'NV']
  },
  {
    id: 'schedule',
    icon: 'schedule',
    title: 'Lịch làm việc',
    roles: ['AD', 'QL', 'AM', 'NV'],
    submenu: [
      { id: 'view-schedule', title: 'Xem lịch làm', path: '/schedule', roles: ['AD', 'QL', 'AM', 'NV'] },
      { id: 'create-schedule', title: 'Tạo lịch làm', path: '/schedule/create', roles: ['AD', 'QL'] }
    ]
  },
  {
    id: 'tasks',
    icon: 'assignment',
    title: 'Công việc',
    roles: ['AD', 'QL', 'AM', 'NV'],
    submenu: [
      { id: 'my-tasks', title: 'Công việc của tôi', path: '/tasks', roles: ['AD', 'QL', 'AM', 'NV'] },
      { id: 'assign-tasks', title: 'Phân công', path: '/tasks/assign', roles: ['AD', 'QL'] }
    ]
  },
  {
    id: 'requests',
    icon: 'request_page',
    title: 'Yêu cầu',
    roles: ['AD', 'QL', 'AM', 'NV'],
    submenu: [
      { id: 'submit-request', title: 'Gửi yêu cầu', path: '/requests/new', roles: ['AD', 'QL', 'AM', 'NV'] },
      { id: 'approve-requests', title: 'Duyệt yêu cầu', path: '/requests/approve', roles: ['AD', 'QL'] }
    ]
  },
  {
    id: 'attendance',
    icon: 'access_time',
    title: 'Chấm công',
    roles: ['AD', 'QL', 'AM', 'NV'],
    submenu: [
      { id: 'check-in-out', title: 'Chấm công', path: '/attendance', roles: ['AD', 'QL', 'AM', 'NV'] },
      { id: 'timesheet', title: 'Bảng công', path: '/timesheet', roles: ['AD', 'QL', 'AM', 'NV'] },
      { id: 'attendance-reports', title: 'Báo cáo chấm công', path: '/attendance/reports', roles: ['AD', 'QL'] }
    ]
  },
  {
    id: 'management',
    icon: 'business_center',
    title: 'Quản lý',
    roles: ['AD', 'QL'],
    submenu: [
      { id: 'employee-mgmt', title: 'Quản lý nhân viên', path: '/employees', roles: ['AD', 'QL'] },
      { id: 'store-mgmt', title: 'Quản lý cửa hàng', path: '/stores', roles: ['AD'] },
      { id: 'registration-approval', title: 'Duyệt đăng ký', path: '/registrations', roles: ['AD'] },
      { id: 'grant-access', title: 'Phân quyền', path: '/permissions', roles: ['AD'] }
    ]
  },
  {
    id: 'personal',
    icon: 'person',
    title: 'Thông tin cá nhân',
    path: '/profile',
    roles: ['AD', 'QL', 'AM', 'NV']
  }
];

export const useSidebarMenu = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Determine if user has access to a menu item
  const hasRole = (roles) => {
    if (!user?.role && !user?.position) return false;
    const userRole = user.role || user.position;
    return roles.includes(userRole);
  };

  // Filter menu items based on user role
  const filteredMenu = useMemo(() => {
    if (!user) return FALLBACK_MENU;
    
    try {
      return FULL_MENU
        .filter(item => hasRole(item.roles))
        .map(item => ({
          ...item,
          submenu: item.submenu?.filter(subitem => hasRole(subitem.roles))
        }));
    } catch (err) {
      console.error('Error filtering menu:', err);
      return FALLBACK_MENU;
    }
  }, [user]);

  // Retry function for manual refresh
  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Since we rely on auth context, we just need to refresh the timestamp
      // The actual user data refresh is handled by AuthContext
      setLastFetch(Date.now());
    } catch (err) {
      console.error('Menu refetch failed:', err);
      setError(err.message || 'Không thể tải menu');
    } finally {
      setLoading(false);
    }
  };

  return {
    menu: filteredMenu,
    loading: authLoading || loading,
    error,
    refetch,
    hasRole
  };
};