import { Chip } from '@mui/material';
import { TicketStatus } from '../../types';

interface TicketBadgeProps {
  status: TicketStatus;
  remainingTickets: number;
}

const statusConfig: Record<TicketStatus, { color: 'success' | 'warning' | 'error'; label: string }> = {
  available: { color: 'success', label: 'Available' },
  almost_full: { color: 'warning', label: 'Almost full' },
  sold_out: { color: 'error', label: 'Sold out' },
};

export const TicketBadge = ({ status, remainingTickets }: TicketBadgeProps) => {
  const { color, label } = statusConfig[status];
  const displayLabel = status === 'sold_out' ? label : `${label} (${remainingTickets})`;
  return <Chip size="small" color={color} label={displayLabel} />;
};
