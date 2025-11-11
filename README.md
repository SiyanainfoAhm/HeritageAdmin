# Heritage Admin Dashboard Web Application

A comprehensive admin dashboard web application for managing the Heritage Flutter Mobile App ecosystem.

## 🚀 Features

- **Dashboard**: Overview statistics and key metrics
- **Masters Management**: CRUD operations for all master data categories
- **Reports**: Comprehensive reporting with export functionality
- **User Management**: View and manage users
- **Booking Management**: View and manage bookings across all modules

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Context API
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth)

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase credentials in `src/config/supabase.ts` (already configured from mobile app)

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── Dashboard/     # Dashboard page
│   ├── Masters/       # Masters management
│   ├── Reports/       # Reports module
│   ├── Users/         # User management
│   └── Bookings/      # Booking management
├── services/          # API services
│   ├── auth.service.ts
│   ├── masterData.service.ts
│   └── dashboard.service.ts
├── context/           # React Context providers
│   └── AuthContext.tsx
├── types/             # TypeScript types
└── config/            # Configuration files
```

## 🔐 Authentication

The application uses Supabase Authentication. Admin users need to be registered in the `heritage_user` table with appropriate user type.

## 📝 Notes

- All API calls use Supabase REST API and RPC functions
- Follows the same database structure as the mobile app
- Responsive design for desktop and tablet devices

## 🚧 Development Status

This is an initial implementation. Additional features and refinements are in progress.

## 📄 License

Proprietary - Heritage Project

