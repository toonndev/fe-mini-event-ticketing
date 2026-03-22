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
import { register as registerApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { LoadingButton } from '../components/common/LoadingButton';

const schema = z
  .object({
    name: z.string().min(1, 'Required'),
    email: z.string().min(1, 'Required').email('Invalid email format'),
    password: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export const RegisterPage = () => {
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
      const res = await registerApi(values.name, values.email, values.password);
      saveAuth(res);
      navigate('/');
    } catch {
      setApiError('Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Mini Event Ticketing System
        </Typography>
        <Typography variant="subtitle2" align="center" mb={3}>
          Create your account
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Full name"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />
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
          <TextField
            label="Confirm password"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={isSubmitting}
            sx={{ mt: 2, mb: 1 }}
          >
            Register
          </LoadingButton>
        </Box>

        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <MuiLink component={Link} to="/login">
            Sign in
          </MuiLink>
        </Typography>
      </Paper>
    </Container>
  );
};
