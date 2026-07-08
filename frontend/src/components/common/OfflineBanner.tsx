import { Alert } from '@mui/material';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/** Persistent banner shown whenever the browser reports it has lost connectivity. */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert
      severity="warning"
      square
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.tooltip,
        justifyContent: 'center',
        borderRadius: 0,
      }}
    >
      You're offline. Changes won't be saved until your connection is restored.
    </Alert>
  );
}
