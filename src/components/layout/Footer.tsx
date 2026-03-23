import { Box, Container, Typography, Divider, Link as MuiLink } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.400',
        mt: 'auto',
        pt: 5,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={{ xs: 3, sm: 6 }}
          mb={4}
        >
          {/* Brand */}
          <Box sx={{ flex: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <ConfirmationNumberIcon sx={{ color: 'primary.light', fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={700} color="white">
                Mini Event Ticketing
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ maxWidth: 280, lineHeight: 1.7 }}>
              ระบบจองบัตรงาน event ออนไลน์ ง่าย รวดเร็ว และปลอดภัย
            </Typography>
          </Box>

          {/* Quick links */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="white" mb={1.5}>
              เมนู
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {[
                { label: 'หน้าหลัก', to: '/' },
                { label: 'ตั๋วของฉัน', to: '/dashboard' },
              ].map(({ label, to }) => (
                <MuiLink
                  key={to}
                  component={Link}
                  to={to}
                  underline="hover"
                  sx={{ color: 'grey.400', '&:hover': { color: 'white' }, fontSize: '0.875rem' }}
                >
                  {label}
                </MuiLink>
              ))}
            </Box>
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="white" mb={1.5}>
              ข้อมูล
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">ติดต่อ: support@goevent.dev</Typography>
              <Typography variant="body2">เปิดให้บริการ 24/7</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'grey.800', mb: 3 }} />

        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1}
        >
          <Typography variant="caption">
            © {year} GoEvent. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
