import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { updateEvent, deleteEvent } from '../api/eventApi';
import { Event, EventStatus } from '../types';

type TabValue = 'all' | EventStatus;

const STATUS_TABS: { label: string; value: TabValue }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const statusColor = (status: EventStatus): 'warning' | 'success' | 'error' | 'default' => {
  if (status === 'published') return 'success';
  if (status === 'draft') return 'warning';
  if (status === 'cancelled') return 'error';
  return 'default';
};

export const AdminEventsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabValue>('all');
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  const { events, pagination, loading, refetch } = useEvents({
    page: page + 1, // BE is 1-indexed
    limit: rowsPerPage,
    status: tab !== 'all' ? tab : undefined,
  });

  const handleTabChange = (_: React.SyntheticEvent, v: TabValue) => {
    setTab(v);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handlePublish = async (event: Event) => {
    setPublishing(event.id);
    try {
      await updateEvent(event.id, { status: 'published' });
      await refetch();
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
      // ถ้าลบ item สุดท้ายในหน้านี้ ให้ถอยหน้า
      if (events.length === 1 && page > 0) setPage((p) => p - 1);
      else await refetch();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            จัดการ Events
          </Typography>
          {!loading && (
            <Typography variant="body2" color="text.secondary">
              {pagination.total} events{tab !== 'all' ? ` (${tab})` : ' ทั้งหมด'}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/events/create')}
        >
          สร้าง Event
        </Button>
      </Box>

      {/* Table with tabs */}
      <Paper variant="outlined">
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {STATUS_TABS.map(({ label, value }) => (
            <Tab
              key={value}
              label={tab === value && !loading ? `${label} (${pagination.total})` : label}
              value={value}
            />
          ))}
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>วันที่จัดงาน</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Tickets</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...new Array(rowsPerPage > 5 ? 5 : rowsPerPage)].map((_, i) => (
                  <TableRow key={i}>
                    {[...new Array(6)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      ไม่มี event ในหมวดนี้
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => {
                  const isPast = new Date(event.endDate ?? event.date) < new Date();
                  return (
                    <TableRow key={event.id} hover>
                      {/* Event name + thumbnail */}
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={event.imageUrl ?? undefined}
                            variant="rounded"
                            sx={{ width: 48, height: 48, bgcolor: 'grey.200', flexShrink: 0 }}
                          >
                            {event.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.main' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              {event.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                            >
                              {event.venue}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Chip
                          label={event.category}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(event.date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                        {isPast && (
                          <Typography variant="caption" color="text.disabled">
                            (ผ่านมาแล้ว)
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={event.status}
                          size="small"
                          color={statusColor(event.status)}
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>

                      {/* Tickets */}
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={500}>
                          {event.remainingTickets}
                          <Typography component="span" variant="caption" color="text.secondary">
                            {' '}/ {event.totalTickets}
                          </Typography>
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                          {event.status === 'draft' && (
                            <Tooltip title="Publish">
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handlePublish(event)}
                                  disabled={publishing === event.id}
                                >
                                  <PublishIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          <Tooltip title="ดูหน้า event">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(event)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination.total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="แถวต่อหน้า"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
        />
      </Paper>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>ลบ event?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            จะลบ &quot;{deleteTarget?.name}&quot; และ booking ทั้งหมดถาวร ไม่สามารถกู้คืนได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
