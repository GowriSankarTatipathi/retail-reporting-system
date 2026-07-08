import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Stack, Typography } from '@mui/material';

/**
 * Would normally consume a token from a password-reset email link, but no
 * such link is ever sent (see ForgotPasswordPage and ROADMAP.md) - there is
 * no backend endpoint to validate a reset token against. Kept as a real,
 * reachable route rather than removed outright so the navigation doesn't
 * dead-end, but it's honest about not being implemented rather than
 * pretending to accept a new password.
 */
export default function ResetPasswordPage() {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h6" component="h2">
        Reset password
      </Typography>

      <Alert severity="info">
        This deployment doesn&apos;t send password-reset emails, so there&apos;s no reset link to
        follow to this page. If you&apos;re signed in, use Change Password from your profile menu.
        Otherwise, contact an administrator.
      </Alert>

      <Button component={RouterLink} to="/login" variant="contained">
        Back to sign in
      </Button>
    </Stack>
  );
}
