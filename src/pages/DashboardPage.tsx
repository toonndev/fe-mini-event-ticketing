import { Container, Typography, Grid, Card, CardContent, Box, Skeleton } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventIcon from '@mui/icons-material/Event';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import { useBookings } from '../hooks/useBookings';
import { BookingList } from '../components/bookings/BookingList';

export const DashboardPage = () => {
  const { bookings, loading, error } = useBookings();

  const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
  const uniqueEvents = new Set(bookings.map((b) => b.eventId)).size;
  const upcoming = bookings.filter((b) => new Date(b.eventDate) > new Date()).length;

  const stats = [
    { label: 'Total booked', value: totalTickets, icon: <ConfirmationNumberIcon color="primary" /> },
    { label: 'Events', value: uniqueEvents, icon: <EventIcon color="secondary" /> },
    { label: 'Upcoming', value: upcoming, icon: <UpcomingIcon color="success" /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" mb={3}>
        My Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        {stats.map(({ label, value, icon }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {label}
                    </Typography>
                    {loading ? (
                      <Skeleton variant="text" width={40} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight={600}>
                        {value}
                      </Typography>
                    )}
                  </Box>
                  {icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" mb={2}>
        My Bookings
      </Typography>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <BookingList bookings={bookings} loading={loading} />
      )}
    </Container>
  );
};
