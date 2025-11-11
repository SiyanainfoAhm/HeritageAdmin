# Heritage Web Application - Implementation Plan

## 📋 Executive Summary

This document outlines the complete plan for building a React-based Admin Dashboard Web Application for the Heritage Flutter Mobile App ecosystem. The web app will provide comprehensive admin capabilities for managing masters data, viewing reports, and administering the platform.

---

## 🎯 Project Overview

### **Application Type**: Admin Dashboard Web Application
### **Frontend**: React 18+ with TypeScript
### **Backend**: Supabase (PostgreSQL + Storage + Auth)
### **UI Framework**: Modern React UI Library (Material-UI / Ant Design / Tailwind CSS)
### **State Management**: React Context API / Zustand
### **Routing**: React Router v6

---

## 📊 System Analysis from Mobile App

### **User Roles Identified** (16 User Types)
1. Tourist (1)
2. Explorer (2)
3. Student (3)
4. Researcher (4)
5. Retailer (5)
6. Food Vendor (6)
7. Hotel Owner (7)
8. Transport (8)
9. Artisan (9)
10. Tour Operator (10)
11. Local Guide (11)
12. Photographer (12)
13. Event Organizer (13)
14. Museum (14)
15. Institution (15)
16. Artist (16)

### **Core Modules Identified**
1. **Heritage Sites** - Historical, Religious, Cultural sites
2. **Hotels & Accommodations** - Hotel listings, rooms, bookings
3. **Food & Beverages** - Restaurants, menus, table bookings
4. **Tours & Packages** - Tour packages, bookings, vehicles, drivers
5. **Local Guides** - Guide profiles, bookings, services
6. **Artisans & Products** - Artisan profiles, products, purchases
7. **Events** - Cultural events, festivals, workshops, bookings
8. **Shops/Retailers** - Heritage shops, products, purchases

### **Database Structure**
- **Supabase URL**: `https://ecvqhfbiwqmqgiqfxheu.supabase.co`
- **Primary Tables**:
  - `Heritage_User` - User accounts
  - `Heritage_UserType` - User role types
  - `Heritage_MasterData` - Master data (languages, site types, etc.)
  - `Heritage_MasterDataTranslation` - Multi-language translations
  - `Heritage_Site` - Heritage sites
  - `Heritage_Hotel` - Hotels
  - `Heritage_HotelBooking` - Hotel bookings
  - `Heritage_Tour` - Tour packages
  - `Heritage_TourBooking` - Tour bookings
  - `Heritage_Event` - Events
  - `Heritage_EventBooking` - Event bookings
  - `Heritage_Food` - Food vendors/restaurants
  - `Heritage_FoodBooking` - Food bookings
  - `Heritage_Artisan` - Artisans
  - `Heritage_Product` - Artisan products
  - `Heritage_ProductPurchase` - Product purchases
  - `Heritage_LocalGuide` - Local guides
  - `Heritage_GuideBooking` - Guide bookings
  - `Heritage_Shop` - Shops/retailers
  - `Heritage_ShopPurchase` - Shop purchases

### **Master Data Categories**
- Languages (EN, HI, GU, JA, ES, FR)
- Site Types (Historical, Religious, Cultural, Natural, etc.)
- User Preferences (Photography, History, Architecture, etc.)
- Report Reasons (Inappropriate, Spam, Misinformation, etc.)
- Age Groups (Under 18, 18-25, 26-35, etc.)
- Travel Purposes (Leisure, Business, Education, etc.)
- Relations (Family, Friend, Colleague, etc.)

---

## 🏗️ Application Architecture

### **Folder Structure**
```
heritage_web_app/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/
│   │   ├── forms/
│   │   └── layout/
│   ├── pages/              # Page components
│   │   ├── Dashboard/
│   │   ├── Masters/
│   │   ├── Reports/
│   │   ├── Users/
│   │   ├── Bookings/
│   │   └── Settings/
│   ├── services/           # API services
│   │   ├── supabase/
│   │   ├── api/
│   │   └── auth/
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React Context providers
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── constants/          # Constants
│   ├── styles/             # Global styles
│   └── App.tsx
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📝 Feature Requirements

### **1. Authentication & Authorization**
- ✅ Admin login/logout
- ✅ Session management
- ✅ Role-based access control
- ✅ Protected routes

### **2. Dashboard (Home)**
- ✅ Overview statistics (Total Users, Bookings, Revenue, etc.)
- ✅ Recent activities
- ✅ Quick actions
- ✅ Charts and graphs (Revenue trends, Booking trends)
- ✅ System health indicators

### **3. Masters Management**
- ✅ **Languages** - CRUD operations
- ✅ **Site Types** - CRUD operations
- ✅ **User Preferences** - CRUD operations
- ✅ **Report Reasons** - CRUD operations
- ✅ **Age Groups** - CRUD operations
- ✅ **Travel Purposes** - CRUD operations
- ✅ **Relations** - CRUD operations
- ✅ **User Types** - View and manage user roles
- ✅ Multi-language translation management
- ✅ Bulk import/export
- ✅ Search and filtering

### **4. Reports Module**
- ✅ **User Reports**
  - User registration trends
  - User type distribution
  - Active vs Inactive users
  - User activity logs
- ✅ **Booking Reports**
  - Booking trends (daily, weekly, monthly)
  - Booking status distribution
  - Revenue reports
  - Booking by module (Hotels, Tours, Events, Food, Guides, Products)
- ✅ **Revenue Reports**
  - Total revenue
  - Revenue by module
  - Revenue trends
  - Payment status reports
- ✅ **Module-wise Reports**
  - Hotel bookings and revenue
  - Tour bookings and revenue
  - Event bookings and revenue
  - Food bookings and revenue
  - Guide bookings and revenue
  - Product purchases and revenue
- ✅ **Export Functionality**
  - Export to CSV
  - Export to PDF
  - Date range filtering
  - Custom report generation

### **5. User Management**
- ✅ View all users
- ✅ Filter by user type
- ✅ Search users
- ✅ View user details
- ✅ Activate/Deactivate users
- ✅ View user bookings

### **6. Booking Management**
- ✅ View all bookings (across all modules)
- ✅ Filter by module, status, date
- ✅ Booking details view
- ✅ Update booking status
- ✅ View payment information

### **7. Content Management**
- ✅ Heritage Sites management
- ✅ Hotels management
- ✅ Tours management
- ✅ Events management
- ✅ Food vendors management
- ✅ Artisans management
- ✅ Guides management
- ✅ Shops management

---

## 🛠️ Technology Stack

### **Frontend**
- **React**: 18.2+
- **TypeScript**: 5.0+
- **UI Library**: Material-UI (MUI) v5 or Ant Design v5
- **Routing**: React Router v6
- **State Management**: Zustand or React Context API
- **Forms**: React Hook Form
- **Charts**: Recharts or Chart.js
- **Date Handling**: date-fns
- **HTTP Client**: Axios or Fetch API
- **Build Tool**: Vite

### **Backend Integration**
- **Supabase Client**: @supabase/supabase-js
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL (via REST API and RPC)
- **Storage**: Supabase Storage (for file uploads)

### **Development Tools**
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript

---

## 📅 Implementation Phases

### **Phase 1: Project Setup & Foundation** (Days 1-2)
- [x] Initialize React + TypeScript project with Vite
- [x] Setup project structure
- [x] Install dependencies
- [x] Configure Supabase client
- [x] Setup routing
- [x] Create authentication service
- [x] Create base layout components
- [x] Setup theme and styling

### **Phase 2: Authentication & Core Layout** (Days 3-4)
- [ ] Implement login page
- [ ] Implement authentication flow
- [ ] Create protected route wrapper
- [ ] Build main layout (Sidebar, Header, Footer)
- [ ] Create navigation menu
- [ ] Implement logout functionality
- [ ] Add loading states and error handling

### **Phase 3: Dashboard** (Days 5-6)
- [ ] Create dashboard page
- [ ] Implement statistics cards
- [ ] Add charts (Revenue, Bookings, Users)
- [ ] Create recent activities section
- [ ] Add quick actions
- [ ] Implement data fetching from Supabase

### **Phase 4: Masters Management** (Days 7-10)
- [ ] Create Masters list page
- [ ] Implement CRUD operations for each master category
- [ ] Add search and filtering
- [ ] Implement multi-language translation management
- [ ] Add bulk operations
- [ ] Create master data form components
- [ ] Add validation

### **Phase 5: Reports Module** (Days 11-14)
- [ ] Create Reports page structure
- [ ] Implement User Reports
- [ ] Implement Booking Reports
- [ ] Implement Revenue Reports
- [ ] Implement Module-wise Reports
- [ ] Add date range filtering
- [ ] Implement export functionality (CSV, PDF)
- [ ] Add charts and visualizations

### **Phase 6: User Management** (Days 15-16)
- [ ] Create Users list page
- [ ] Implement user filtering and search
- [ ] Create user details view
- [ ] Add user activation/deactivation
- [ ] Show user bookings

### **Phase 7: Booking Management** (Days 17-18)
- [ ] Create Bookings list page
- [ ] Implement filtering by module and status
- [ ] Create booking details view
- [ ] Add booking status update functionality

### **Phase 8: Content Management** (Days 19-22)
- [ ] Create content management pages for each module
- [ ] Implement view/edit functionality
- [ ] Add content approval workflow
- [ ] Implement bulk operations

### **Phase 9: Testing & Refinement** (Days 23-25)
- [ ] Unit testing
- [ ] Integration testing
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation

### **Phase 10: Deployment** (Day 26)
- [ ] Production build
- [ ] Environment configuration
- [ ] Deploy to hosting platform
- [ ] Final testing

---

## 🔐 Security Considerations

1. **Authentication**
   - Secure admin login
   - JWT token management
   - Session timeout
   - Password policies

2. **Authorization**
   - Role-based access control
   - Route protection
   - API endpoint security

3. **Data Security**
   - Input validation
   - SQL injection prevention (Supabase handles this)
   - XSS prevention
   - CSRF protection

4. **API Security**
   - Use Supabase RLS (Row Level Security)
   - Secure API keys
   - Rate limiting

---

## 📊 Database Functions to Use

### **Master Data Functions**
- `get_heritage_master_data(category, language_code)` - Get master data
- `get_heritage_master_categories()` - Get all categories

### **Dashboard Functions**
- `heritage_get_dashboard_data(user_id, ...)` - Dashboard statistics
- Various module-specific dashboard functions

### **Report Functions**
- Custom SQL queries for reports
- Aggregation functions for statistics

---

## 🎨 UI/UX Guidelines

### **Design Principles**
- Clean and modern interface
- Consistent color scheme
- Responsive design (Desktop-first, mobile-friendly)
- Accessible (WCAG 2.1 AA)
- Fast loading times
- Intuitive navigation

### **Color Scheme**
- Primary: Heritage theme colors (to be defined)
- Secondary: Complementary colors
- Success: Green
- Error: Red
- Warning: Orange
- Info: Blue

### **Components**
- Cards for statistics
- Tables for data listing
- Forms for input
- Modals for details/editing
- Charts for visualizations
- Filters and search bars

---

## 📦 Dependencies

### **Core Dependencies**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@supabase/supabase-js": "^2.38.0",
  "@mui/material": "^5.14.0",
  "@mui/icons-material": "^5.14.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.48.0",
  "recharts": "^2.10.0",
  "date-fns": "^2.30.0",
  "zustand": "^4.4.0"
}
```

### **Dev Dependencies**
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.0",
  "typescript": "^5.2.0",
  "vite": "^5.0.0",
  "eslint": "^8.54.0",
  "prettier": "^3.1.0"
}
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Supabase account and project

### **Setup Steps**
1. Clone/create project
2. Install dependencies: `npm install`
3. Configure Supabase credentials
4. Start development server: `npm run dev`
5. Build for production: `npm run build`

---

## 📝 Notes

- All API calls will use Supabase REST API and RPC functions
- Follow mobile app's database structure and naming conventions
- Maintain consistency with mobile app's data models
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Add loading states for async operations
- Optimize for performance

---

## ✅ Success Criteria

1. ✅ Admin can login securely
2. ✅ Admin can view dashboard with key metrics
3. ✅ Admin can manage all master data categories
4. ✅ Admin can view comprehensive reports
5. ✅ Admin can manage users
6. ✅ Admin can view and manage bookings
7. ✅ Application is responsive and user-friendly
8. ✅ Application is performant and secure

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0

