import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useAccount';
import { toApiError } from '@/services/api';
import { FormTextField } from '@/components/forms/FormTextField';
import { updateProfileSchema, type UpdateProfileFormValues } from '@/validators/authSchemas';

export function UpdateProfileForm() {
  const { user, setUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const updateProfile = useUpdateProfile();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: user?.fullName ?? '' },
  });

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setServerError(null);
    try {
      const updated = await updateProfile.mutateAsync(values);
      setUser(updated);
      enqueueSnackbar('Profile updated.', { variant: 'success' });
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  if (!user) return null;

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 420 }}
    >
      {serverError && <Alert severity="error">{serverError}</Alert>}

      <FormTextField name="fullName" control={control} label="Full name" autoComplete="name" />
      <TextField
        label="Email"
        value={user.email}
        disabled
        fullWidth
        helperText="Email cannot be changed here"
      />
      <TextField label="Role" value={user.role} disabled fullWidth />

      <Button
        type="submit"
        variant="contained"
        loading={isSubmitting}
        disabled={!isDirty}
        sx={{ alignSelf: 'flex-start' }}
      >
        Save changes
      </Button>
    </Stack>
  );
}
