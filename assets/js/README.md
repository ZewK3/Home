# JavaScript Files Documentation

This directory contains all JavaScript files for the HR Management System. Each file has a specific purpose and functionality.

## Core Configuration & Utilities

### `config.js` (12 lines)
**Purpose:** Application configuration constants
- API URLs and endpoints
- Storage keys
- Polling intervals and retry settings

### `utils.js` (704 lines)
**Purpose:** Common utility functions
- Notification system
- Date/time helpers
- DOM manipulation utilities
- Data validation functions

### `secure-storage.js` (252 lines)
**Purpose:** Enhanced security storage management
- Encrypted localStorage alternatives
- Secure cookie handling
- Authentication token management

## Authentication & Authorization

### `auth-manager.js` (577 lines)
**Purpose:** Authentication management system
- User login/logout functionality
- Token management and validation
- Session handling
- Integration with secure storage

### `auth-handler.js` (1,233 lines)
**Purpose:** Main authentication handler (formerly script.js)
- Login form processing
- Password validation
- User role management
- Authentication API calls

### `menu-manager.js` (209 lines)
**Purpose:** Role-based menu visibility
- Menu item filtering by user roles
- Desktop and mobile menu synchronization
- Permission-based navigation control

## User Interface & Experience

### `theme-manager.js` (15 lines)
**Purpose:** Theme management system
- Light theme implementation
- Theme persistence
- Theme switching functionality

### `home-page.js` (216 lines)
**Purpose:** Home page functionality (formerly github-home.js)
- GitHub-inspired theme toggle
- Hero section animations
- Responsive navigation
- Interactive elements

### `landing-page.js` (489 lines)
**Purpose:** Enhanced landing page features (formerly landing-enhanced.js)
- Interactive animations
- Counter animations
- Scroll effects
- Tilt effects and parallax

## Content Management

### `content-manager.js` (1,142 lines)
**Purpose:** Modern modular content management system
- Employee data management
- Attendance tracking
- Task assignment
- Permission management
- Statistics and reporting

### `main-init.js` (56 lines)
**Purpose:** Application initialization coordinator
- Module initialization sequence
- Global instance management
- Startup configuration

## Communication & Chat

### `customer-chat-widget.js` (603 lines)
**Purpose:** Customer support chat widget (formerly chat-widget.js)
- Real-time customer support messaging
- Professional UI for external users
- Integration with customer support system
- Mobile-responsive chat interface

### `dashboard-chat.js` (877 lines)
**Purpose:** Internal dashboard chat system (formerly chat-widget-enhanced.js)
- Employee-to-employee communication
- Department chat functionality
- Enhanced features (emoji, reactions, file sharing)
- Professional internal chat interface

### `notification-chat-manager.js` (993 lines)
**Purpose:** Notification and chat management
- Real-time notifications
- Chat functionality coordination
- Message handling
- Status management

## Specialized Features

### `customer-support.js` (496 lines)
**Purpose:** Customer support functionality
- Support ticket management
- Conversation handling
- Status tracking
- Integration with Enhanced HR Database Schema v3.0

### `dashboard-enhancements.js` (573 lines)
**Purpose:** Dashboard-specific enhancements
- Sidebar accordion functionality
- Dashboard UI improvements
- Mobile menu management
- Interactive dashboard elements

## File Usage by Pages

### Home Page (`/index.html`)
- `home-page.js` - GitHub-inspired homepage functionality
- `customer-chat-widget.js` - Customer support chat

### Dashboard (`/pages/dashboard/dashboard.html`)
- `config.js` - Configuration
- `utils.js` - Utilities
- `secure-storage.js` - Storage management
- `auth-manager.js` - Authentication
- `theme-manager.js` - Theme management
- `menu-manager.js` - Menu management
- `content-manager.js` - Content management
- `notification-chat-manager.js` - Notifications
- `dashboard-chat.js` - Internal chat
- `main-init.js` - Initialization
- `dashboard-enhancements.js` - Dashboard enhancements

### Authentication (`/pages/auth/index.html`)
- `auth-handler.js` - Login/authentication handling

### Customer Support (`/pages/customer-support/index.html`)
- `config.js` - Configuration
- `utils.js` - Utilities
- `auth-manager.js` - Authentication
- `auth-handler.js` - Authentication handling
- `customer-support.js` - Support functionality

## Recent Cleanup (Current Session)

### Files Removed
1. **`content-manager-old.js`** (13,506 lines) - Superseded by modern content-manager.js
2. **`home-chat.js`** (376 lines) - Home chat functionality moved to dashboard only
3. **`landing.js`** (472 lines) - Basic version replaced by enhanced landing-page.js

### Files Renamed for Clarity
1. **`github-home.js`** → **`home-page.js`** - Clearer homepage functionality naming
2. **`chat-widget.js`** → **`customer-chat-widget.js`** - Clarifies customer support purpose
3. **`chat-widget-enhanced.js`** → **`dashboard-chat.js`** - Clarifies internal chat purpose
4. **`script.js`** → **`auth-handler.js`** - Clarifies authentication handling purpose
5. **`landing-enhanced.js`** → **`landing-page.js`** - Clearer landing page naming

### Total Reduction
- **Removed:** 14,354 lines of code (63% reduction)
- **From:** 19 files (22,801 lines) 
- **To:** 16 files (8,447 lines)
- **Eliminated:** 3 duplicate/unused files
- **Renamed:** 5 files for better clarity

All functionality has been preserved while significantly improving code organization and maintainability.