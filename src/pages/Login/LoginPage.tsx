import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load saved credentials on component mount (only if not authenticated)
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const savedPassword = localStorage.getItem('rememberedPassword');
      const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

      if (savedRememberMe && savedEmail) {
        setEmail(savedEmail);
        if (savedPassword) {
          setPassword(savedPassword);
        }
        setRememberMe(true);
      }
    }
  }, [isAuthenticated, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      await login(email, password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setRememberMe(checked);
    
    // If unchecking, clear saved credentials
    if (!checked) {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      localStorage.removeItem('rememberMe');
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#fdf7f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render login form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fdf7f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          backgroundColor: '#4285f4',
          borderRadius: 2,
          padding: '12px 24px',
          marginBottom: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#ffffff',
            fontWeight: 500,
            textTransform: 'lowercase',
            fontFamily: 'sans-serif',
          }}
        >
          logo
        </Typography>
      </Box>

      {/* Login Form Card */}
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 450,
          padding: 4,
          borderRadius: 3,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            color: '#4285f4',
            fontWeight: 'bold',
            marginBottom: 3,
            fontFamily: 'sans-serif',
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
          }}
        >
          Admin Login - Ahmedabad Heritage
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <TextField
            fullWidth
            label="Email ID"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
            placeholder="Enter your email ID"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Remember Me Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={handleRememberMeChange}
                sx={{
                  color: '#4285f4',
                  '&.Mui-checked': {
                    color: '#4285f4',
                  },
                }}
              />
            }
            label="Remember me"
            sx={{
              marginTop: 1,
              marginBottom: 2,
              '& .MuiFormControlLabel-label': {
                fontFamily: 'sans-serif',
                color: 'text.primary',
              },
            }}
          />

          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={formLoading}
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              backgroundColor: '#f08060',
              color: '#ffffff',
              fontWeight: 'bold',
              borderRadius: 2,
              fontSize: '1rem',
              fontFamily: 'sans-serif',
              '&:hover': {
                backgroundColor: '#e07050',
              },
              '&:disabled': {
                backgroundColor: '#f08060',
                opacity: 0.7,
              },
            }}
          >
            {formLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </Paper>

      {/* Footer Copyright */}
      <Typography
        variant="body2"
        sx={{
          marginTop: 4,
          color: 'text.secondary',
          fontFamily: 'sans-serif',
          fontSize: '0.875rem',
        }}
      >
        ©2005 Ahmedabad Heritage. All rights reserved
      </Typography>
    </Box>
  );
};

export default LoginPage;

