import { Card, CardContent, Skeleton, Box } from '@mui/material';

export const EventCardSkeleton = () => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Box mt={2}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="50%" />
      </Box>
      <Box mt={2}>
        <Skeleton variant="rounded" width="100%" height={6} />
      </Box>
    </CardContent>
  </Card>
);
