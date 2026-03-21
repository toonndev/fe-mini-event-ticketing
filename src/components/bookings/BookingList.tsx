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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../../types';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
}

export const BookingList = ({ bookings, loading }: BookingListProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              {['Event', 'Qty', 'Booked at', 'Status'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(4)].map((__, j) => (
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
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell align="center">Qty</TableCell>
            <TableCell>Booked at</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((b) => (
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
                <Chip size="small" color="success" label="Confirmed" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
