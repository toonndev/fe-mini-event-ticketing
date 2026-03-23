import { Container, Typography, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';
import { EventCardSkeleton } from '../components/events/EventCardSkeleton';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EventSlider } from '../components/events/EventSlider';

export const EventListPage = () => {
  const { events, loading, error, refetch } = useEvents();
  const navigate = useNavigate();

  // 5 nearest upcoming events for slider
  const sliderEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  // Random 3 upcoming events for recommendations
  const recommended = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.date) >= now);
    return [...upcoming].sort(() => Math.random() - 0.5).slice(0, 3);
  }, [events]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Slider */}
      {!loading && !error && sliderEvents.length > 0 && (
        <EventSlider events={sliderEvents} />
      )}

      {/* Recommended for you */}
      {!loading && !error && recommended.length > 0 && (
        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            แนะนำสำหรับคุณ
          </Typography>
          <Grid container spacing={3}>
            {recommended.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} onClick={(id) => navigate(`/events/${id}`)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* All Events */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Upcoming Events
        </Typography>
        {!loading && !error && (
          <Typography variant="subtitle2" color="text.secondary">
            {events.length} events available
          </Typography>
        )}
      </Box>

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      <Grid container spacing={3}>
        {loading
          ? [...new Array(3)].map((_, i) => (
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
