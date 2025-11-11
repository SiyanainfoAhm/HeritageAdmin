import { Box, Button, Paper, Typography, Grid } from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  BookOnline as BookOnlineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Master Data',
      icon: <AddIcon />,
      color: '#1976d2',
      onClick: () => navigate('/masters'),
    },
    {
      label: 'View Reports',
      icon: <AssessmentIcon />,
      color: '#2e7d32',
      onClick: () => navigate('/reports'),
    },
    {
      label: 'Search Users',
      icon: <PeopleIcon />,
      color: '#ed6c02',
      onClick: () => navigate('/users'),
    },
    {
      label: 'View Bookings',
      icon: <BookOnlineIcon />,
      color: '#9c27b0',
      onClick: () => navigate('/bookings'),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{
                height: '100%',
                py: 2,
                borderColor: action.color,
                color: action.color,
                '&:hover': {
                  borderColor: action.color,
                  backgroundColor: `${action.color}10`,
                },
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions;

