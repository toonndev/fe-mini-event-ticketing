import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Box,
  LinearProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoadingButton } from '../common/LoadingButton';
import { createBooking } from '../../api/bookingApi';

interface BookingFormProps {
  eventId: string;
  remainingTickets: number;
  usedQuota: number;
  isPast?: boolean;
  onSuccess: () => void;
}

const MAX_QUOTA = 5;

const buildSchema = (maxQty: number) =>
  z.object({
    quantity: z
      .number({ invalid_type_error: 'Please enter a number' })
      .int()
      .min(1, 'Minimum 1 ticket')
      .max(maxQty, `Maximum ${maxQty} ticket(s)`),
  });

type FormValues = { quantity: number };

export const BookingForm = ({ eventId, remainingTickets, usedQuota, isPast, onSuccess }: BookingFormProps) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxQty = Math.min(MAX_QUOTA - usedQuota, remainingTickets);
  const isSoldOut = remainingTickets === 0;
  const isQuotaReached = usedQuota >= MAX_QUOTA;
  const isDisabled = isPast || isSoldOut || isQuotaReached;
  let buttonLabel = 'Book now';
  if (isPast) buttonLabel = 'Event ended';
  else if (isSoldOut) buttonLabel = 'Sold out';
  else if (isQuotaReached) buttonLabel = 'Quota reached';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(maxQty)),
    defaultValues: { quantity: 1 },
  });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    setLoading(true);
    try {
      await createBooking(eventId, values.quantity);
      reset();
      onSuccess();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409 || status === 400) {
        setApiError('Tickets are no longer available');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quotaPercent = (usedQuota / MAX_QUOTA) * 100;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Book tickets
        </Typography>

        {isPast && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This event has already ended.
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            size="small"
            inputProps={{ min: 1, max: maxQty }}
            disabled={isDisabled}
            error={!!errors.quantity}
            helperText={errors.quantity?.message}
            sx={{ mb: 2 }}
            {...register('quantity', { valueAsNumber: true })}
          />

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              My bookings: {usedQuota} / {MAX_QUOTA} used
            </Typography>
            <LinearProgress
              variant="determinate"
              value={quotaPercent}
              color={usedQuota >= MAX_QUOTA ? 'error' : 'primary'}
              sx={{ borderRadius: 4, height: 6 }}
            />
          </Box>

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={loading}
            disabled={isDisabled}
          >
            {buttonLabel}
          </LoadingButton>
        </Box>
      </CardContent>
    </Card>
  );
};
