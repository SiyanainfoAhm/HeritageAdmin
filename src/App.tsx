import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Dashboard2 from './pages/Dashboard/Dashboard2';
import Masters from './pages/Masters/Masters';
import AddHeritageSite from './pages/Masters/AddHeritageSite';
import Reports from './pages/Reports/Reports';
import Analytics from './pages/Analytics/Analytics';
import Reports2 from './pages/Reports/Reports2';
import Users from './pages/Users/Users';
import Bookings from './pages/Bookings/Bookings';
import ProtectedRoute from './components/common/ProtectedRoute';
import Verification from './pages/Verification/Verification';
import Marketing from './pages/Marketing/Marketing';
import NotificationTemplate from './pages/Manage/NotificationTemplate';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dashboard-2" element={<Dashboard2 />} />
              <Route path="masters" element={<Masters />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports-2" element={<Reports2 />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<Users />} />
              <Route path="verification" element={<Verification />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="masters/heritage-sites/new" element={<AddHeritageSite />} />
              <Route path="masters/heritage-sites/:siteId/edit" element={<AddHeritageSite />} />
              <Route path="notification-templates" element={<NotificationTemplate />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

