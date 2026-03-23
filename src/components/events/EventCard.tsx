import {
  Card,
  CardActionArea,
  CardContent,
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

  return (
    <Card sx={{ opacity: isPast ? 0.6 : 1 }}>
      <CardActionArea onClick={() => !isPast && onClick(event.id)} disabled={isPast}>
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
