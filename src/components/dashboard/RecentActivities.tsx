import { Box, Paper, Typography, List, ListItem, ListItemText, Avatar, Chip, Divider } from '@mui/material';
import {
  BookOnline as BookOnlineIcon,
  PersonAdd as PersonAddIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { RecentActivity } from '@/services/dashboard.service';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentActivitiesProps {
  activities: RecentActivity[];
  loading?: boolean;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <BookOnlineIcon />;
      case 'user':
        return <PersonAddIcon />;
      case 'payment':
        return <PaymentIcon />;
      default:
        return <BookOnlineIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#1976d2';
      case 'user':
        return '#2e7d32';
      case 'payment':
        return '#ed6c02';
      default:
        return '#9c27b0';
    }
  };

  const formatModuleName = (module?: string) => {
    if (!module) return '';
    const names: Record<string, string> = {
      hotel: 'Hotel',
      tour: 'Tour',
      event: 'Event',
      food: 'Food',
      guide: 'Guide',
    };
    return names[module] || module;
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Activities
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography variant="body2" color="text.secondary">
            Loading activities...
          </Typography>
        </Box>
      ) : activities.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No recent activities
        </Typography>
      ) : (
        <List>
          {activities.map((activity, index) => (
            <Box key={activity.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <Avatar
                  sx={{
                    bgcolor: `${getActivityColor(activity.type)}20`,
                    color: getActivityColor(activity.type),
                    mr: 2,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.title}
                      </Typography>
                      {activity.module && (
                        <Chip label={formatModuleName(activity.module)} size="small" />
                      )}
                      {activity.amount && (
                        <Typography variant="caption" color="success.main" fontWeight="medium">
                          ₹{activity.amount.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" component="span">
                        {activity.description}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RecentActivities;

