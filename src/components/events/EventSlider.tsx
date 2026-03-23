import { Box, Typography, IconButton, Chip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';
import { TicketBadge } from './TicketBadge';

interface EventSliderProps {
  events: Event[];
}

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

export const EventSlider = ({ events }: EventSliderProps) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [events.length]);

  if (events.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % events.length);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          position: 'relative',
          height: { xs: 220, sm: 320, md: 400 },
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        {events.map((event, index) => (
          <Box
            key={event.id}
            onClick={() => navigate(`/events/${event.id}`)}
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: index === current ? 1 : 0,
              transition: 'opacity 0.7s ease',
              cursor: 'pointer',
              backgroundImage: event.imageUrl
                ? `url(${event.imageUrl})`
                : PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark gradient overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)',
              }}
            />

            {/* Content */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2, sm: 3 },
                color: 'white',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                <Chip
                  label={event.category}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.6)',
                    textTransform: 'capitalize',
                    fontSize: '0.7rem',
                  }}
                />
                <TicketBadge status={event.ticketStatus} remainingTickets={event.remainingTickets} />
              </Box>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)', lineHeight: 1.2, mb: 0.75 }}
              >
                {event.name}
              </Typography>

              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <CalendarMonthIcon fontSize="small" sx={{ opacity: 0.85 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {new Date(event.date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOnIcon fontSize="small" sx={{ opacity: 0.85 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {event.venue}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}

        {/* Arrow buttons */}
        {events.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              size="small"
              sx={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.45)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              size="small"
              sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.45)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}

        {/* Slide counter badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 10,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {current + 1} / {events.length}
        </Box>
      </Box>

      {/* Indicator dots */}
      {events.length > 1 && (
        <Box display="flex" justifyContent="center" gap={0.75} mt={1.5}>
          {events.map((_, i) => (
            <Box
              key={i}
              onClick={() => setCurrent(i)}
              sx={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: i === current ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
