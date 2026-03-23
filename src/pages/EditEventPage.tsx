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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '../hooks/useEvents';
import { updateEvent } from '../api/eventApi';
import { LoadingButton } from '../components/common/LoadingButton';
import { useAuth } from '../hooks/useAuth';

const EVENT_CATEGORIES = ['concert', 'conference', 'sport', 'workshop', 'festival', 'exhibition', 'other'] as const;
const EVENT_STATUSES = ['draft', 'published', 'cancelled'] as const;

const schema = z
  .object({
    name: z.string().min(1, 'Required'),
    description: z.string().min(1, 'Required'),
    date: z
      .string()
      .min(1, 'Required')
      .refine((val) => {
        const localDate = new Date(val + ':00');
        return localDate.getTime() > Date.now();
      }, 'Event date must be in the future'),
    endDate: z.string().optional(),
    venue: z.string().min(1, 'Required'),
    totalTickets: z
      .number({ invalid_type_error: 'Must be a number' })
      .int()
      .min(1, 'At least 1 ticket'),
    category: z.enum(EVENT_CATEGORIES, { errorMap: () => ({ message: 'Required' }) }),
    ticketPrice: z.number().min(0).optional(),
    imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
    maxTicketsPerUser: z.number().int().min(1).max(20).optional(),
    status: z.enum(EVENT_STATUSES).optional(),
    tags: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate && data.date) {
      const start = new Date(data.date);
      const end = new Date(data.endDate);
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be after start date',
          path: ['endDate'],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const toLocalDatetimeString = (iso: string): string => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

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
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!event) return;
    reset({
      name: event.name,
      description: event.description,
      date: toLocalDatetimeString(event.date),
      endDate: event.endDate ? toLocalDatetimeString(event.endDate) : '',
      venue: event.venue,
      totalTickets: event.totalTickets,
      category: event.category,
      ticketPrice: event.ticketPrice,
      imageUrl: event.imageUrl ?? '',
      maxTicketsPerUser: event.maxTicketsPerUser,
      status: event.status,
      tags: event.tags?.join(', ') ?? '',
    });
  }, [event, reset]);

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      const tagsArray = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined;
      await updateEvent(id!, {
        name: values.name,
        description: values.description,
        date: new Date(values.date).toISOString(),
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
        venue: values.venue,
        totalTickets: values.totalTickets,
        category: values.category,
        ticketPrice: values.ticketPrice,
        imageUrl: values.imageUrl || undefined,
        maxTicketsPerUser: values.maxTicketsPerUser,
        status: values.status,
        tags: tagsArray,
      });
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
            {[...new Array(9)].map((_, i) => (
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

            <FormControl fullWidth margin="normal" error={!!errors.category} disabled={!isAdmin}>
              <InputLabel id="category-label">Category</InputLabel>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select labelId="category-label" label="Category" {...field}>
                    {EVENT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
            </FormControl>

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
              label="End Date & Time (optional)"
              type="datetime-local"
              fullWidth
              margin="normal"
              disabled={!isAdmin}
              InputLabelProps={{ shrink: true }}
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
              {...register('endDate')}
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
            <TextField
              label="Ticket price (฿)"
              type="number"
              fullWidth
              margin="normal"
              disabled={!isAdmin}
              inputProps={{ min: 0 }}
              error={!!errors.ticketPrice}
              helperText={errors.ticketPrice?.message ?? 'Set to 0 for free events'}
              {...register('ticketPrice', { valueAsNumber: true })}
            />
            <TextField
              label="Image URL (optional)"
              fullWidth
              margin="normal"
              disabled={!isAdmin}
              error={!!errors.imageUrl}
              helperText={errors.imageUrl?.message}
              {...register('imageUrl')}
            />
            <TextField
              label="Max tickets per user (optional)"
              type="number"
              fullWidth
              margin="normal"
              disabled={!isAdmin}
              inputProps={{ min: 1, max: 20 }}
              error={!!errors.maxTicketsPerUser}
              helperText={errors.maxTicketsPerUser?.message}
              {...register('maxTicketsPerUser', { valueAsNumber: true })}
            />

            <FormControl fullWidth margin="normal" error={!!errors.status} disabled={!isAdmin}>
              <InputLabel id="status-label">Status</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select labelId="status-label" label="Status" {...field}>
                    {EVENT_STATUSES.map((s) => (
                      <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
            </FormControl>

            <TextField
              label="Tags (optional)"
              fullWidth
              margin="normal"
              disabled={!isAdmin}
              error={!!errors.tags}
              helperText={errors.tags?.message ?? 'Separate tags with commas'}
              {...register('tags')}
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
