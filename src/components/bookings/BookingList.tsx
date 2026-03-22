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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Booking } from '../../types';
import { cancelBooking } from '../../api/bookingApi';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  onCancelled?: () => void;
}

export const BookingList = ({ bookings, loading, onCancelled }: BookingListProps) => {
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

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
      <TableContainer component={Paper} variant="outlined">
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
      <TableContainer component={Paper} variant="outlined">
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
            {bookings.map((b) => {
              const isUpcoming = new Date(b.eventDate) > new Date();
              return (
                <TableRow key={b.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
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
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
