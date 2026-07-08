import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { queryClient } from '@/config/queryClient';
import App from './App';

describe('App', () => {
  it('redirects an unauthenticated visitor to the login page', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // AuthProvider's silent session-restore attempt resolves (no refresh
    // token in localStorage -> unauthenticated), ProtectedRoute redirects to
    // /login, which renders inside AuthLayout.
    expect(
      await screen.findByRole('heading', { name: /retail reporting system/i })
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });
});
