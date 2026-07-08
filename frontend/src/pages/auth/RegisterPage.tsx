import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { toApiError } from '@/services/api';
import { FormTextField } from '@/components/forms/FormTextField';
import { registerSchema, type RegisterFormValues } from '@/validators/authSchemas';

/** Self-registration always creates a VIEWER account server-side (see RegisterRequest.java) -
 *  there is deliberately no role selector here. */
export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" component="h2">
        Create an account
      </Typography>
      <Typography variant="body2" color="text.secondary">
        New accounts start with view-only access. An administrator can grant additional permissions
        afterward.
      </Typography>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <FormTextField
        name="fullName"
        control={control}
        label="Full name"
        autoComplete="name"
        autoFocus
      />
      <FormTextField
        name="email"
        control={control}
        label="Email"
        type="email"
        autoComplete="email"
      />
      <FormTextField
        name="password"
        control={control}
        label="Password"
        type="password"
        autoComplete="new-password"
        helperText="At least 8 characters, with an uppercase letter, a lowercase letter, and a digit"
      />

      <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
        Create account
      </Button>

      <Button component={RouterLink} to="/login" variant="text" size="small">
        Already have an account? Sign in
      </Button>
    </Stack>
  );
}
