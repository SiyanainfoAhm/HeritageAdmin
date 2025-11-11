import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CampaignIcon from '@mui/icons-material/Campaign';
import TimelineIcon from '@mui/icons-material/Timeline';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/context/AuthContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { text: 'Dashboard 2', icon: TimelineIcon, path: '/dashboard-2' },
  { text: 'Reports', icon: AssessmentIcon, path: '/reports' },
  { text: 'Analytics', icon: AnalyticsIcon, path: '/analytics' },
  { text: 'Manage', icon: SettingsIcon, path: '/masters' },
  { text: 'User Management', icon: PeopleAltIcon, path: '/users' },
  { text: 'Verification', icon: VerifiedUserIcon, path: '/verification' },
  { text: 'Marketing', icon: CampaignIcon, path: '/marketing' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const drawer = (
    <Box
      sx={{
        height: '100%',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#f08060',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}
          >
            H
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: '#424242',
            fontWeight: 500,
            fontFamily: 'sans-serif',
          }}
        >
          logo Heritage
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: active ? '#f08060' : 'transparent',
                  color: active ? '#ffffff' : '#424242',
                  '&:hover': {
                    backgroundColor: active ? '#f08060' : 'rgba(0, 0, 0, 0.04)',
                  },
                  position: 'relative',
                  pl: active ? 2.5 : 2,
                  py: 1.5,
                  '&::before': active
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '60%',
                        backgroundColor: '#f08060',
                        borderRadius: '0 2px 2px 0',
                      }
                    : {},
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? '#ffffff' : '#424242',
                  }}
                >
                  <IconComponent />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontFamily: 'sans-serif',
                    fontWeight: active ? 500 : 400,
                    fontSize: '0.9375rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: '#424242',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#424242' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontFamily: 'sans-serif',
              fontSize: '0.9375rem',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          backgroundColor: '#fafafa',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;

