import { Container, Typography, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';
import { EventCardSkeleton } from '../components/events/EventCardSkeleton';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const EventListPage = () => {
  const { events, loading, error, refetch } = useEvents();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h5">Upcoming Events</Typography>
        {!loading && !error && (
          <Typography variant="subtitle2">{events.length} events available</Typography>
        )}
      </Box>

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      <Grid container spacing={3}>
        {loading
          ? [...Array(3)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <EventCardSkeleton />
              </Grid>
            ))
          : events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} onClick={(id) => navigate(`/events/${id}`)} />
              </Grid>
            ))}
      </Grid>
    </Container>
  );
};
