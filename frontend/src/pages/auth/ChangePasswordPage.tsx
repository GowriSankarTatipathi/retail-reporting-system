import { Stack, Typography } from '@mui/material';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';

export default function ChangePasswordPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h1">
        Change password
      </Typography>
      <ChangePasswordForm />
    </Stack>
  );
}
