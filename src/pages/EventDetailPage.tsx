import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useEvent } from '../hooks/useEvents';
import { useBookings } from '../hooks/useBookings';
import { BookingForm } from '../components/bookings/BookingForm';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { TicketBadge } from '../components/events/TicketBadge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { event, loading, error, refetch } = useEvent(id!);
  const { bookings, loading: bookingsLoading } = useBookings();
  const [snackOpen, setSnackOpen] = useState(false);

  const usedQuota = bookings.filter((b) => b.eventId === id).reduce((sum, b) => sum + b.quantity, 0);

  const [quotaReady, setQuotaReady] = useState(false);
  useEffect(() => {
    if (!bookingsLoading) setQuotaReady(true);
  }, [bookingsLoading]);

  const soldPercent = event
    ? ((event.totalTickets - event.remainingTickets) / event.totalTickets) * 100
    : 0;

  const handleBookingSuccess = () => {
    setSnackOpen(true);
    refetch();
  };

  if (error) return <Container sx={{ py: 4 }}><ErrorAlert message={error} onRetry={refetch} /></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Events
        </MuiLink>
        <Typography color="text.primary">{loading ? '...' : event?.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          {loading ? (
            <Box>
              <Skeleton variant="text" width="70%" height={40} />
              <Skeleton variant="rounded" width={100} height={24} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
            </Box>
          ) : event ? (
            <>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h5">{event.name}</Typography>
                <TicketBadge status={event.status} remainingTickets={event.remainingTickets} />
              </Box>

              <Typography variant="body1" color="text.secondary" mb={3}>
                {event.description}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box display="flex" flexDirection="column" gap={1.5} mb={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarMonthIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    {new Date(event.date).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon color="action" fontSize="small" />
                  <Typography variant="body2">{event.venue}</Typography>
                </Box>
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Tickets remaining
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {event.remainingTickets} / {event.totalTickets}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={soldPercent}
                  color={event.status === 'sold_out' ? 'error' : event.status === 'almost_full' ? 'warning' : 'success'}
                  sx={{ borderRadius: 4, height: 8 }}
                />
              </Box>

              <Box mt={3} display="flex" gap={1} flexWrap="wrap">
                <Chip label={`${event.totalTickets} total capacity`} variant="outlined" size="small" />
                <Chip label={`${event.remainingTickets} remaining`} variant="outlined" size="small" />
              </Box>
            </>
          ) : null}
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          {loading || !quotaReady ? (
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={6} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={40} />
              </CardContent>
            </Card>
          ) : event ? (
            <BookingForm
              eventId={event.id}
              remainingTickets={event.remainingTickets}
              usedQuota={usedQuota}
              onSuccess={handleBookingSuccess}
            />
          ) : null}
        </Grid>
      </Grid>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackOpen(false)}>
          Booking confirmed!
        </Alert>
      </Snackbar>
    </Container>
  );
};
