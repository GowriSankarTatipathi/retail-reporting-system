import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormDialog } from '@/components/common/FormDialog';
import { FormTextField } from '@/components/forms/FormTextField';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { toApiError } from '@/services/api';
import { customerSchema, type CustomerFormValues } from '@/validators/customerSchemas';
import type { Customer } from '@/types';

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

const EMPTY_VALUES: CustomerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
};

export function CustomerFormDialog({ open, onClose, customer }: CustomerFormDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? {
              firstName: customer.firstName,
              lastName: customer.lastName,
              email: customer.email,
              phone: customer.phone ?? '',
              address: customer.address ?? '',
              city: customer.city ?? '',
              state: customer.state ?? '',
              zipCode: customer.zipCode ?? '',
            }
          : EMPTY_VALUES
      );
      setServerError(null);
    }
  }, [open, customer, reset]);

  const onSubmit = async (values: CustomerFormValues) => {
    setServerError(null);
    const request = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      zipCode: values.zipCode || null,
    };
    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, request });
        enqueueSnackbar('Customer updated.', { variant: 'success' });
      } else {
        await createCustomer.mutateAsync(request);
        enqueueSnackbar('Customer created.', { variant: 'success' });
      }
      onClose();
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  return (
    <FormDialog
      open={open}
      title={customer ? 'Edit customer' : 'New customer'}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      serverError={serverError}
      maxWidth="md"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="firstName" control={control} label="First name" autoFocus />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="lastName" control={control} label="Last name" />
        </Grid>
        <Grid size={12}>
          <FormTextField name="email" control={control} label="Email" type="email" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="phone" control={control} label="Phone" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="address" control={control} label="Address" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField name="city" control={control} label="City" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField name="state" control={control} label="State" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField name="zipCode" control={control} label="ZIP code" />
        </Grid>
      </Grid>
    </FormDialog>
  );
}
