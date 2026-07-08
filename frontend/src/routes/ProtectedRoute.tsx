import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

/**
 * Gates every route nested under it on an authenticated session. Renders a
 * loading state while the silent session-restore attempt (see AuthContext)
 * is in flight, so an authenticated user with a valid refresh token never
 * flashes the login page on reload.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress aria-label="Checking your session" />
      </Stack>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
