import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

/** Keeps an already-authenticated user off /login and /register - sends them to the dashboard instead. */
export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress aria-label="Checking your session" />
      </Stack>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
