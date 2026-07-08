import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Stack, Typography } from '@mui/material';

/**
 * There is deliberately no email-delivery flow behind this page. Sending a
 * password reset email requires SMTP infrastructure this backend does not
 * provision (see ROADMAP.md "Near-Term: Email-based password reset") - a fake
 * "check your email" success message would be a lie to the user, so this
 * page states the real options instead of pretending to work.
 */
export default function ForgotPasswordPage() {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h6" component="h2">
        Forgot your password?
      </Typography>

      <Alert severity="info">
        Email-based password reset isn&apos;t available in this deployment yet - it requires
        outbound email infrastructure that hasn&apos;t been provisioned (see the project roadmap).
        If you can still sign in, use Change Password from your profile menu instead. Otherwise, ask
        an administrator to reset your account.
      </Alert>

      <Button component={RouterLink} to="/login" variant="contained">
        Back to sign in
      </Button>
    </Stack>
  );
}
