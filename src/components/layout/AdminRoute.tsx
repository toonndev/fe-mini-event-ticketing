import { Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AdminRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};
