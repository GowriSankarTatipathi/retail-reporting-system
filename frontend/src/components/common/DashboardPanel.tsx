import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, Skeleton, Stack } from '@mui/material';
import { ErrorState } from '@/components/common/ErrorState';

interface DashboardPanelProps {
  title: string;
  action?: ReactNode;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  children: ReactNode;
}

/** Consistent card shell for every dashboard panel: title, optional action, loading/error handling. */
export function DashboardPanel({
  title,
  action,
  isLoading,
  errorMessage,
  onRetry,
  children,
}: DashboardPanelProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        action={action}
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 600 } } }}
      />
      <CardContent>
        {isLoading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={220} />
          </Stack>
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
