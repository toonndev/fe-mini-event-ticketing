import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useEvents, useFeaturedEvents } from '../hooks/useEvents';
import { useGlobalLive } from '../hooks/useGlobalLive';
import { useDebounce } from '../hooks/useDebounce';
import { EventCard } from '../components/events/EventCard';
import { EventCardSkeleton } from '../components/events/EventCardSkeleton';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EventSlider } from '../components/events/EventSlider';

const CATEGORIES = ['all', 'concert', 'conference', 'sport', 'workshop', 'festival', 'exhibition', 'other'] as const;
const ITEMS_PER_PAGE = 9;

export const EventListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  // Server-side paginated list
  const { events, pagination, loading, error, refetch } = useEvents({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    category: category !== 'all' ? category : undefined,
    status: 'published',
  });

  // Featured events for slider + recommendations (separate lightweight fetch)
  const featuredEvents = useFeaturedEvents();

  const sliderEvents = useMemo(() => {
    const now = new Date();
    return [...featuredEvents]
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [featuredEvents]);

  const recommended = useMemo(() => {
    const now = new Date();
    const upcoming = featuredEvents.filter((e) => new Date(e.date) >= now);
    return [...upcoming].sort(() => Math.random() - 0.5).slice(0, 3);
  }, [featuredEvents]);

  const liveMap = useGlobalLive();

  const isFiltering = debouncedSearch !== '' || category !== 'all';

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.endDate ?? e.date) >= now);
  const pastEvents = events.filter((e) => new Date(e.endDate ?? e.date) < now);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Slider */}
      {sliderEvents.length > 0 && !isFiltering && (
        <EventSlider events={sliderEvents} />
      )}

      {/* Recommended */}
      {recommended.length > 0 && !isFiltering && (
        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            แนะนำสำหรับคุณ
          </Typography>
          <Grid container spacing={3}>
            {recommended.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} onClick={(id) => navigate(`/events/${id}`)} liveData={liveMap.get(event.id)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Search + Category filter */}
      <Box mb={3}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          gap={2}
          mb={2}
        >
          <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
            {isFiltering
              ? `ผลการค้นหา${pagination.total > 0 ? ` (${pagination.total})` : ''}`
              : 'Upcoming Events'}
          </Typography>
          <TextField
            size="small"
            placeholder="ค้นหา event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 260 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat === 'all' ? 'ทั้งหมด' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              onClick={() => setCategory(cat)}
              color={category === cat ? 'primary' : 'default'}
              variant={category === cat ? 'filled' : 'outlined'}
              size="small"
              sx={{ textTransform: 'capitalize', cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {/* Upcoming events grid */}
      <Grid container spacing={3}>
        {loading
          ? [...new Array(ITEMS_PER_PAGE)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <EventCardSkeleton />
              </Grid>
            ))
          : events.length === 0
          ? (
              <Grid item xs={12}>
                <Box textAlign="center" py={8}>
                  <Typography color="text.secondary">ไม่พบ event ที่ตรงกับการค้นหา</Typography>
                </Box>
              </Grid>
            )
          : upcomingEvents.length === 0
          ? (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">ไม่มี upcoming events ในขณะนี้</Typography>
                </Box>
              </Grid>
            )
          : upcomingEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} onClick={(id) => navigate(`/events/${id}`)} liveData={liveMap.get(event.id)} />
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={5}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(_, v) => {
              setPage(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Past events */}
      {!loading && pastEvents.length > 0 && (
        <Box mt={6}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" fontWeight={600} mb={3} color="text.secondary">
            Past Events
          </Typography>
          <Grid container spacing={3}>
            {pastEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} onClick={(id) => navigate(`/events/${id}`)} liveData={liveMap.get(event.id)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};
