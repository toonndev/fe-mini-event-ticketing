import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEvent } from '../api/eventApi';
import { LoadingButton } from '../components/common/LoadingButton';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  date: z
    .string()
    .min(1, 'Required')
    .refine((val) => new Date(val) > new Date(), 'Event date must be in the future'),
  venue: z.string().min(1, 'Required'),
  totalTickets: z
    .number({ invalid_type_error: 'Must be a number' })
    .int()
    .min(1, 'At least 1 ticket'),
});

type FormValues = z.infer<typeof schema>;

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      await createEvent({ ...values, date: new Date(values.date).toISOString() });
      navigate('/');
    } catch {
      setApiError('Failed to create event. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Events
        </MuiLink>
        <Typography color="text.primary">Create event</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create Event
        </Typography>

        {!isAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have view-only access. Admin role is required to create events.
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Event name"
            fullWidth
            margin="normal"
            disabled={!isAdmin}
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            disabled={!isAdmin}
            error={!!errors.description}
            helperText={errors.description?.message}
            {...register('description')}
          />
          <TextField
            label="Date & Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            disabled={!isAdmin}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().slice(0, 16) }}
            error={!!errors.date}
            helperText={errors.date?.message}
            {...register('date')}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            disabled={!isAdmin}
            error={!!errors.venue}
            helperText={errors.venue?.message}
            {...register('venue')}
          />
          <TextField
            label="Total tickets"
            type="number"
            fullWidth
            margin="normal"
            disabled={!isAdmin}
            inputProps={{ min: 1 }}
            error={!!errors.totalTickets}
            helperText={errors.totalTickets?.message}
            {...register('totalTickets', { valueAsNumber: true })}
          />

          <Box display="flex" gap={2} mt={3}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!isAdmin}
              sx={{ flex: 1 }}
            >
              Create Event
            </LoadingButton>
            <LoadingButton
              loading={false}
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ flex: 1 }}
            >
              Cancel
            </LoadingButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
