import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

/**
 * Nested inside <ProtectedRoute>, so `user` is guaranteed non-null here.
 * Redirects to /403 rather than hiding the route entirely - matches the
 * backend's role matrix (docs/api.md) so a MANAGER hitting /admin sees an
 * explicit "not allowed" page instead of a confusing blank screen, the same
 * way the API itself would respond with a real 403.
 */
export function RequireRole({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
