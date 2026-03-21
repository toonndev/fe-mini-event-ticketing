import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { ReactNode } from 'react';

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  children: ReactNode;
}

export const LoadingButton = ({ loading, children, disabled, ...props }: LoadingButtonProps) => (
  <Button
    disabled={loading || disabled}
    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
    {...props}
  >
    {children}
  </Button>
);
