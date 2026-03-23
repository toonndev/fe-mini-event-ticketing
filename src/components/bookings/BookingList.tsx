import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Typography,
  Box,
  Button,
  Skeleton,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Booking } from '../../types';
import { cancelBooking } from '../../api/bookingApi';

type TabValue = 'all' | 'upcoming' | 'past';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  onCancelled?: () => void;
}

export const BookingList = ({ bookings, loading, onCancelled }: BookingListProps) => {
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [tab, setTab] = useState<TabValue>('upcoming');

  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: bookings.length,
      upcoming: bookings.filter((b) => new Date(b.eventDate) > now).length,
      past: bookings.filter((b) => new Date(b.eventDate) <= now).length,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const now = new Date();
    if (tab === 'upcoming') return bookings.filter((b) => new Date(b.eventDate) > now);
    if (tab === 'past') return bookings.filter((b) => new Date(b.eventDate) <= now);
    return bookings;
  }, [bookings, tab]);

  const handleConfirmCancel = async () => {
    if (!confirmId) return;
    setCancelling(true);
    try {
      await cancelBooking(confirmId);
      onCancelled?.();
    } finally {
      setCancelling(false);
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Event', 'Qty', 'Booked at', 'Status', ''].map((h, i) => (
                  <TableCell key={i}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...new Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...new Array(5)].map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={2}>
        <Typography color="text.secondary">No bookings yet</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Browse events
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Paper variant="outlined">
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v: TabValue) => setTab(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Upcoming (${counts.upcoming})`} value="upcoming" />
          <Tab label={`Past (${counts.past})`} value="past" />
          <Tab label={`ทั้งหมด (${counts.all})`} value="all" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell>Booked at</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      ไม่มีการจองในหมวดนี้
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => {
                  const isUpcoming = new Date(b.eventDate) > new Date();
                  return (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                          onClick={() => navigate(`/events/${b.eventId}`)}
                        >
                          {b.eventName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(b.eventDate).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          · {b.venue}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{b.quantity}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(b.bookedAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={isUpcoming ? 'success' : 'default'}
                          label={isUpcoming ? 'Confirmed' : 'Past'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {isUpcoming && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => setConfirmId(b.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!confirmId} onClose={() => !cancelling && setConfirmId(null)}>
        <DialogTitle>Cancel booking?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tickets will be refunded and returned to the event pool.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)} disabled={cancelling}>
            Keep
          </Button>
          <Button color="error" onClick={handleConfirmCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Yes, cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
