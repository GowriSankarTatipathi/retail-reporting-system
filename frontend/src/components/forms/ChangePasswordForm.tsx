import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useChangePassword } from '@/hooks/useAccount';
import { toApiError } from '@/services/api';
import { FormTextField } from '@/components/forms/FormTextField';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/validators/authSchemas';

/** Shared by the standalone /change-password route and the Profile page's security tab. */
export function ChangePasswordForm() {
  const { enqueueSnackbar } = useSnackbar();
  const changePassword = useChangePassword();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      enqueueSnackbar('Password changed successfully.', { variant: 'success' });
      reset();
    } catch (error) {
      const apiError = toApiError(error);
      setServerError(apiError.status === 401 ? 'Current password is incorrect.' : apiError.message);
    }
  };

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 420 }}
    >
      {serverError && <Alert severity="error">{serverError}</Alert>}

      <FormTextField
        name="currentPassword"
        control={control}
        label="Current password"
        type="password"
        autoComplete="current-password"
      />
      <FormTextField
        name="newPassword"
        control={control}
        label="New password"
        type="password"
        autoComplete="new-password"
        helperText="At least 8 characters, with an uppercase letter, a lowercase letter, and a digit"
      />
      <FormTextField
        name="confirmNewPassword"
        control={control}
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ alignSelf: 'flex-start' }}
      >
        Change password
      </Button>
    </Stack>
  );
}
