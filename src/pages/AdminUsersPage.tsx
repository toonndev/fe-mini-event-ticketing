import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Select,
  MenuItem,
  Box,
  Skeleton,
  Alert,
  Snackbar,
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '../types';
import { getUsers, updateUserRole } from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [snackMessage, setSnackMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUpdatingId(userId);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setSnackMessage(`Role updated to "${role}" successfully`);
    } catch {
      setSnackMessage('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h5">User Management</Typography>
        <Typography variant="subtitle2">Manage user roles and permissions</Typography>
      </Box>

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have view-only access. Admin role is required to change user roles.
        </Alert>
      )}

      {error && isAdmin && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? [...new Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...new Array(4)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.role}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={user.role}
                        disabled={!isAdmin || updatingId === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        sx={{ minWidth: 110 }}
                      >
                        <MenuItem value="user">user</MenuItem>
                        <MenuItem value="admin">admin</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={!!snackMessage}
        autoHideDuration={3000}
        onClose={() => setSnackMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackMessage?.includes('Failed') ? 'error' : 'success'}
          onClose={() => setSnackMessage(null)}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
