import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '../hooks/useEvents';
import { updateEvent } from '../api/eventApi';
import { LoadingButton } from '../components/common/LoadingButton';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  date: z
    .string()
    .min(1, 'Required')
    .refine((val) => {
      const localDate = new Date(val + ':00');
      return localDate.getTime() > Date.now();
    }, 'Event date must be in the future'),
  venue: z.string().min(1, 'Required'),
  totalTickets: z
    .number({ invalid_type_error: 'Must be a number' })
    .int()
    .min(1, 'At least 1 ticket'),
});

type FormValues = z.infer<typeof schema>;

export const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { event, loading } = useEvent(id!);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!event) return;
    // Convert ISO date → datetime-local string (local time)
    const d = new Date(event.date);
    const localStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    reset({
      name: event.name,
      description: event.description,
      date: localStr,
      venue: event.venue,
      totalTickets: event.totalTickets,
    });
  }, [event, reset]);

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      await updateEvent(id!, { ...values, date: new Date(values.date).toISOString() });
      navigate(`/events/${id}`);
    } catch {
      setApiError('Failed to update event. Please try again.');
    }
  };

  const localMin = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Events
        </MuiLink>
        <MuiLink component={Link} to={`/events/${id}`} underline="hover" color="inherit">
          {event?.name ?? '...'}
        </MuiLink>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Event
        </Typography>

        {!isAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have view-only access. Admin role is required to edit events.
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {loading ? (
          <Box>
            {[...new Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 2 }} />
            ))}
          </Box>
        ) : (
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
              inputProps={{ min: localMin }}
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
                Save changes
              </LoadingButton>
              <LoadingButton
                loading={false}
                variant="outlined"
                onClick={() => navigate(`/events/${id}`)}
                sx={{ flex: 1 }}
              >
                Cancel
              </LoadingButton>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};
