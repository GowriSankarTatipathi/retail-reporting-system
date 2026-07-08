import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/services/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Never retry auth/permission/validation/not-found failures - retrying
        // a 401/403/404/400 just wastes a round trip on an error that won't
        // resolve itself.
        if (error instanceof ApiError && error.status !== null && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
