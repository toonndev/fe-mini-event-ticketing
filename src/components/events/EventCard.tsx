import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Event } from '../../types';
import { TicketBadge } from './TicketBadge';
import { useEventLive } from '../../hooks/useEventLive';

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

interface EventCardProps {
  event: Event;
  onClick: (id: string) => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const liveData = useEventLive(event.id);
  const remainingTickets = liveData?.remainingTickets ?? event.remainingTickets;
  const ticketStatus = liveData?.ticketStatus ?? event.ticketStatus;
  const soldPercent = ((event.totalTickets - remainingTickets) / event.totalTickets) * 100;
  const isPast = new Date(event.date) < new Date();

  const priceLabel = event.ticketPrice > 0
    ? `฿${event.ticketPrice.toLocaleString()}`
    : 'Free';

  // deterministic placeholder based on event id char sum
  const placeholderIndex =
    event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    PLACEHOLDER_GRADIENTS.length;

  return (
    <Card sx={{ opacity: isPast ? 0.6 : 1 }}>
      <CardActionArea onClick={() => !isPast && onClick(event.id)} disabled={isPast}>
        {/* Image / placeholder */}
        {event.imageUrl ? (
          <CardMedia
            component="img"
            height="160"
            image={event.imageUrl}
            alt={event.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 160,
              background: PLACEHOLDER_GRADIENTS[placeholderIndex],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 700,
                textAlign: 'center',
                px: 2,
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {event.name}
            </Typography>
          </Box>
        )}

        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, mr: 1 }}>
              <Typography variant="h6">
                {event.name}
              </Typography>
              {isPast && (
                <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                  (Ended)
                </Typography>
              )}
            </Box>
            <TicketBadge status={ticketStatus} remainingTickets={remainingTickets} />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {event.description}
          </Typography>

          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <CalendarMonthIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {new Date(event.date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {event.venue}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Chip label={event.category} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
            <Chip label={priceLabel} size="small" color={event.ticketPrice > 0 ? 'default' : 'success'} variant="outlined" />
          </Box>

          <Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Tickets remaining
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {remainingTickets} / {event.totalTickets}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={soldPercent}
              color={ticketStatus === 'sold_out' ? 'error' : ticketStatus === 'almost_full' ? 'warning' : 'success'}
              sx={{ borderRadius: 4, height: 6 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
