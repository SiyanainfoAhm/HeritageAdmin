import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Chip, CircularProgress } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DashboardService } from '@/services/dashboard.service';

const SystemHealth = () => {
  const [health, setHealth] = useState<{ status: 'healthy' | 'warning' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const healthStatus = await DashboardService.checkSystemHealth();
      setHealth(healthStatus);
    } catch (error) {
      setHealth({ status: 'error', message: 'Health check failed' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        System Health
      </Typography>
      {loading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Checking...
          </Typography>
        </Box>
      ) : health ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getStatusIcon(health.status)}
            label={health.status.toUpperCase()}
            color={getStatusColor(health.status) as any}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {health.message}
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
};

export default SystemHealth;

