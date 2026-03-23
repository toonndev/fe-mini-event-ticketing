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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { EventBooking } from '../types';
import { getEventBookings } from '../api/adminApi';
import { useEvent } from '../hooks/useEvents';
import { useBookings } from '../hooks/useBookings';
import { useEventLive } from '../hooks/useEventLive';
import { useAuth } from '../hooks/useAuth';
import { BookingForm } from '../components/bookings/BookingForm';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { TicketBadge } from '../components/events/TicketBadge';
import { deleteEvent } from '../api/eventApi';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { event, loading, error } = useEvent(id!);
  const { bookings, loading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const liveData = useEventLive(id);
  const [snackOpen, setSnackOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [buyers, setBuyers] = useState<EventBooking[]>([]);
  const [buyersLoading, setBuyersLoading] = useState(false);

  const fetchBuyers = useCallback(async () => {
    if (!id || !isAdmin) return;
    setBuyersLoading(true);
    try {
      const data = await getEventBookings(id);
      setBuyers(data);
    } finally {
      setBuyersLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const remainingTickets = liveData?.remainingTickets ?? event?.remainingTickets ?? 0;
  const ticketStatus = liveData?.ticketStatus ?? event?.ticketStatus ?? 'available';

  const usedQuota = bookings.filter((b) => b.eventId === id).reduce((sum, b) => sum + b.quantity, 0);

  const [quotaReady, setQuotaReady] = useState(false);
  useEffect(() => {
    if (!bookingsLoading) setQuotaReady(true);
  }, [bookingsLoading]);

  const isPast = event ? new Date(event.endDate ?? event.date) < new Date() : false;

  const soldPercent = event
    ? ((event.totalTickets - remainingTickets) / event.totalTickets) * 100
    : 0;

  const handleBookingSuccess = () => {
    setSnackOpen(true);
    refetchBookings();
    fetchBuyers();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(id!);
      navigate('/');
    } catch {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (error) return <Container sx={{ py: 4 }}><ErrorAlert message={error} /></Container>;

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
              <Skeleton variant="rectangular" width="100%" height={240} sx={{ mb: 2, borderRadius: 2 }} />
              <Skeleton variant="text" width="70%" height={40} />
              <Skeleton variant="rounded" width={100} height={24} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
            </Box>
          ) : event ? (
            <>
              {event.imageUrl && (
                <Box
                  component="img"
                  src={event.imageUrl}
                  alt={event.name}
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 3,
                  }}
                />
              )}

              <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                <Typography variant="h5" sx={{ flex: 1 }}>{event.name}</Typography>
                <TicketBadge status={ticketStatus} remainingTickets={remainingTickets} />
                {isAdmin && (
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/admin/events/${id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
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
                {event.endDate && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarMonthIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Ends:{' '}
                      {new Date(event.endDate).toLocaleDateString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon color="action" fontSize="small" />
                  <Typography variant="body2">{event.venue}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocalOfferIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    {event.ticketPrice > 0 ? `฿${event.ticketPrice.toLocaleString()}` : 'Free'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={3} flexWrap="wrap">
                <Chip
                  label={event.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                {event.tags && event.tags.length > 0 && event.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Tickets remaining
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {remainingTickets} / {event.totalTickets}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={soldPercent}
                  color={ticketStatus === 'sold_out' ? 'error' : ticketStatus === 'almost_full' ? 'warning' : 'success'}
                  sx={{ borderRadius: 4, height: 8 }}
                />
              </Box>

              <Box mt={3} display="flex" gap={1} flexWrap="wrap">
                <Chip label={`${event.totalTickets} total capacity`} variant="outlined" size="small" />
                <Chip label={`${remainingTickets} remaining`} variant="outlined" size="small" />
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
              remainingTickets={remainingTickets}
              usedQuota={usedQuota}
              isPast={isPast}
              maxTicketsPerUser={event.maxTicketsPerUser ?? 5}
              onSuccess={handleBookingSuccess}
            />
          ) : null}
        </Grid>
      </Grid>

      {isAdmin && (
        <Box mt={5}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" mb={2}>
            Buyers ({buyers.reduce((sum, b) => sum + b.quantity, 0)} tickets sold)
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell>Booked at</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buyersLoading
                  ? [...new Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        {[...new Array(4)].map((__, j) => (
                          <TableCell key={j}><Skeleton variant="text" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : buyers.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No bookings yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  : buyers.map((b) => (
                      <TableRow key={b.bookingId} hover>
                        <TableCell>{b.user.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {b.user.email}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{b.quantity}</TableCell>
                        <TableCell>
                          {new Date(b.bookedAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)}>
        <DialogTitle>Delete event?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete &quot;{event?.name}&quot; and all its bookings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </Button>
        </DialogActions>
      </Dialog>

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
