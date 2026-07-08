import { Button, Stack, Typography } from '@mui/material';

export default function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <Stack
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '70vh', p: 4 }}
    >
      <Typography variant="h2" color="text.secondary" sx={{ fontWeight: 700 }}>
        500
      </Typography>
      <Typography variant="h6">Something went wrong</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', maxWidth: 420 }}
      >
        An unexpected error occurred. Try again, and if the problem persists, contact support.
      </Typography>
      <Button variant="contained" onClick={onRetry ?? (() => window.location.reload())}>
        Try again
      </Button>
    </Stack>
  );
}
