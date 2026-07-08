import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';

export default function ForbiddenPage() {
  return (
    <Stack
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '70vh', p: 4 }}
    >
      <Typography variant="h2" color="text.secondary" sx={{ fontWeight: 700 }}>
        403
      </Typography>
      <Typography variant="h6">You don&apos;t have access to this page</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', maxWidth: 420 }}
      >
        Your account role doesn&apos;t include this permission. Contact an administrator if you
        believe this is a mistake.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Back to dashboard
      </Button>
    </Stack>
  );
}
