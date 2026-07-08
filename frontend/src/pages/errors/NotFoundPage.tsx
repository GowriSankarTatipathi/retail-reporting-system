import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Stack
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '70vh', p: 4 }}
    >
      <Typography variant="h2" color="text.secondary" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography variant="h6">Page not found</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', maxWidth: 420 }}
      >
        The page you&apos;re looking for doesn&apos;t exist, or the URL may be mistyped.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Back to dashboard
      </Button>
    </Stack>
  );
}
