import { useEffect, useState } from 'react';
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
  Collapse,
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
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '@/context/AuthContext';

const drawerWidth = 260;

type MenuIcon = typeof DashboardIcon;

interface MenuChild {
  text: string;
  path: string;
  icon?: MenuIcon;
}

interface MenuItem {
  text: string;
  icon: MenuIcon;
  path?: string;
  children?: MenuChild[];
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    children: [{ text: 'Dashboard 2', path: '/dashboard-2', icon: TimelineIcon }],
  },
  {
    text: 'Reports',
    icon: AssessmentIcon,
    path: '/reports',
    children: [
      { text: 'Reports 2', path: '/reports-2' },
    ],
  },
  { text: 'Analytics', icon: AnalyticsIcon, path: '/analytics' },
  { 
    text: 'Manage', 
    icon: SettingsIcon, 
    path: '/masters',
    children: [
      { text: 'Notification Template', path: '/notification-templates', icon: NotificationsIcon },
    ],
  },
  { text: 'User Management', icon: PeopleAltIcon, path: '/users' },
  { text: 'Verification', icon: VerifiedUserIcon, path: '/verification' },
  { text: 'Marketing', icon: CampaignIcon, path: '/marketing' },
];

const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPathActive = (path: string) => location.pathname === path;

  const isMenuItemActive = (item: MenuItem) => {
    if (item.path && isPathActive(item.path)) {
      return true;
    }

    if (item.children) {
      return item.children.some((child) => isPathActive(child.path));
    }

    return false;
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) {
        initialState[item.text] = isMenuItemActive(item);
      }
    });
    return initialState;
  });

  useEffect(() => {
    setOpenMenus((prev) => {
      const updated = { ...prev };
      menuItems.forEach((item) => {
        if (item.children) {
          updated[item.text] = isMenuItemActive(item);
        }
      });
      return updated;
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const active = isMenuItemActive(item);
          const iconColor = active ? '#ffffff' : '#424242';
          const isOpen = hasChildren ? openMenus[item.text] : false;

          const handleMenuClick = () => {
            if (hasChildren) {
              setOpenMenus((prev) => ({
                ...prev,
                [item.text]: !prev[item.text],
              }));
              if (item.path) {
                navigate(item.path);
              }
            } else if (item.path) {
              navigate(item.path);
            }
          };

          return (
            <ListItem key={item.text} disablePadding sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <ListItemButton
                onClick={handleMenuClick}
                sx={{
                  borderRadius: 2,
                  backgroundColor: active ? '#f08060' : 'transparent',
                  color: iconColor,
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
                    color: iconColor,
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
                {hasChildren &&
                  (isOpen ? (
                    <ExpandLessIcon sx={{ color: iconColor, fontSize: '1rem' }} />
                  ) : (
                    <ExpandMoreIcon sx={{ color: iconColor, fontSize: '1rem' }} />
                  ))}
              </ListItemButton>
              {hasChildren && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit sx={{ alignSelf: 'stretch', width: '100%' }}>
                  <List component="div" disablePadding sx={{ px: 1, pb: 0.5 }}>
                    {item.children?.map((child) => {
                      const childActive = isPathActive(child.path);
                      const ChildIcon = child.icon ?? FiberManualRecordIcon;
                      return (
                        <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => navigate(child.path)}
                            sx={{
                              borderRadius: 2,
                              ml: 4.5,
                              mr: 0.5,
                              pl: 2.5,
                              py: 1.25,
                              backgroundColor: childActive ? '#fde6df' : 'transparent',
                              color: childActive ? '#f08060' : '#424242',
                              '&:hover': {
                                backgroundColor: childActive ? '#fde6df' : 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 32,
                                color: childActive ? '#f08060' : '#757575',
                                '& svg': {
                                  fontSize: child.icon ? '1rem' : '0.625rem',
                                },
                              }}
                            >
                              <ChildIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.text}
                              primaryTypographyProps={{
                                fontFamily: 'sans-serif',
                                fontSize: '0.875rem',
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
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

