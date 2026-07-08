import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useLocation, useNavigate, type Location } from 'react-router-dom';
import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { toApiError } from '@/services/api';
import { FormTextField } from '@/components/forms/FormTextField';
import { loginSchema, type LoginFormValues } from '@/validators/authSchemas';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" component="h2">
        Sign in
      </Typography>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <FormTextField
        name="email"
        control={control}
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
      />
      <FormTextField
        name="password"
        control={control}
        label="Password"
        type="password"
        autoComplete="current-password"
      />

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Link component={RouterLink} to="/forgot-password" variant="body2">
          Forgot password?
        </Link>
      </Stack>

      <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
        Sign in
      </Button>

      <Button component={RouterLink} to="/register" variant="text" size="small">
        Don&apos;t have an account? Register
      </Button>
    </Stack>
  );
}
