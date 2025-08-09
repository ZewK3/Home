import React from 'react';
import DashboardHome from './sections/DashboardHome';
import Timesheet from './sections/Timesheet';
import Attendance from './sections/Attendance';
import WorkTasks from './sections/WorkTasks';
import AttendanceRequest from './sections/AttendanceRequest';
import TaskAssignment from './sections/TaskAssignment';
import ShiftAssignment from './sections/ShiftAssignment';
import PermissionManagement from './sections/PermissionManagement';
import Analytics from './sections/Analytics';

const MainContent = ({ currentSection, user, onNavigate }) => {
  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardHome user={user} onNavigate={onNavigate} />;
      case 'timesheet':
        return <Timesheet user={user} />;
      case 'attendance':
        return <Attendance user={user} />;
      case 'work-tasks':
        return <WorkTasks user={user} />;
      case 'attendance-request':
        return <AttendanceRequest user={user} />;
      case 'task-assignment':
        return <TaskAssignment user={user} />;
      case 'shift-assignment':
        return <ShiftAssignment user={user} />;
      case 'permission-management':
        return <PermissionManagement user={user} />;
      case 'analytics':
        return <Analytics user={user} />;
      default:
        return <DashboardHome user={user} onNavigate={onNavigate} />;
    }
  };

  return (
    <main className="main-content">
      <div className="content-container">
        {renderSection()}
      </div>
    </main>
  );
};

export default MainContent;