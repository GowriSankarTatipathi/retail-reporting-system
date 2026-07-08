import { lazy, Suspense, type ComponentType } from 'react';
import { LinearProgress } from '@mui/material';

/**
 * Wraps a route-level page import in React.lazy + Suspense so each page is
 * its own code-split chunk instead of one large bundle (MUI + Recharts +
 * TanStack Table pull in enough weight that this matters for real - see the
 * "chunks larger than 500kB" build warning without it).
 */
export function lazyRoute(importFn: () => Promise<{ default: ComponentType }>) {
  const LazyComponent = lazy(importFn);
  return (
    <Suspense fallback={<LinearProgress aria-label="Loading page" />}>
      <LazyComponent />
    </Suspense>
  );
}
