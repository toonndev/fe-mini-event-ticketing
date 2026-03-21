import {
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  Box,
  Link as MuiLink,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { LoadingButton } from '../components/common/LoadingButton';

const schema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email format'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const { login: saveAuth } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      const res = await login(values.email, values.password);
      saveAuth(res);
      navigate('/');
    } catch {
      setApiError('Invalid email or password');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Ticketly
        </Typography>
        <Typography variant="subtitle2" align="center" mb={3}>
          Sign in to your account
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
            sx={{ mt: 2, mb: 1 }}
          >
            Sign in
          </LoadingButton>
        </Box>

        <Typography variant="body2" align="center">
          Don&apos;t have an account?{' '}
          <MuiLink component={Link} to="/register">
            Register
          </MuiLink>
        </Typography>
      </Paper>
    </Container>
  );
};
