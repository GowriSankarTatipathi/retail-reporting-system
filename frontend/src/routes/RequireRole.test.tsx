import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RequireRole } from './RequireRole';
import type { User } from '@/types';

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRole(user: User | null, allowedRoles: User['role'][]) {
  mockUseAuth.mockReturnValue({ user });

  const router = createMemoryRouter(
    [
      {
        element: <RequireRole allowedRoles={allowedRoles} />,
        children: [{ path: '/reports', element: <div>Reports content</div> }],
      },
      { path: '/403', element: <div>Forbidden</div> },
    ],
    { initialEntries: ['/reports'] }
  );

  return render(<RouterProvider router={router} />);
}

describe('RequireRole', () => {
  it('renders the route when the user has an allowed role', () => {
    renderWithRole(
      { id: 1, email: 'a@b.com', fullName: 'A', role: 'MANAGER', enabled: true, createdAt: '' },
      ['ADMIN', 'MANAGER', 'ANALYST']
    );
    expect(screen.getByText('Reports content')).toBeInTheDocument();
  });

  it('redirects to /403 when the user role is not allowed', () => {
    renderWithRole(
      { id: 1, email: 'a@b.com', fullName: 'A', role: 'VIEWER', enabled: true, createdAt: '' },
      ['ADMIN', 'MANAGER', 'ANALYST']
    );
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
    expect(screen.queryByText('Reports content')).not.toBeInTheDocument();
  });
});
