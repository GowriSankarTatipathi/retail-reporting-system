import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormDialog } from '@/components/common/FormDialog';
import { FormTextField } from '@/components/forms/FormTextField';
import { useAdjustInventory } from '@/hooks/useProducts';
import { toApiError } from '@/services/api';
import { inventoryAdjustSchema, type InventoryAdjustFormValues } from '@/validators/catalogSchemas';
import type { Product } from '@/types';

interface InventoryAdjustDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export function InventoryAdjustDialog({ open, onClose, product }: InventoryAdjustDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const adjustInventory = useAdjustInventory();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<InventoryAdjustFormValues>({
    resolver: zodResolver(inventoryAdjustSchema),
    defaultValues: { quantityDelta: 0, reason: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ quantityDelta: 0, reason: '' });
      setServerError(null);
    }
  }, [open, reset]);

  const onSubmit = async (values: InventoryAdjustFormValues) => {
    if (!product) return;
    setServerError(null);
    try {
      await adjustInventory.mutateAsync({
        id: product.id,
        request: { quantityDelta: values.quantityDelta, reason: values.reason || null },
      });
      enqueueSnackbar('Inventory adjusted.', { variant: 'success' });
      onClose();
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  return (
    <FormDialog
      open={open}
      title={`Adjust stock - ${product?.name ?? ''}`}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      serverError={serverError}
      submitLabel="Apply adjustment"
    >
      <Typography variant="body2" color="text.secondary">
        Current on hand: {product?.quantityOnHand ?? 0}. Enter a positive number to restock, or a
        negative number to write off stock.
      </Typography>
      <Controller
        name="quantityDelta"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            label="Quantity delta"
            type="number"
            fullWidth
            autoFocus
            value={field.value}
            onChange={(e) => field.onChange(Number(e.target.value))}
            onBlur={field.onBlur}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <FormTextField
        name="reason"
        control={control}
        label="Reason (optional)"
        multiline
        minRows={2}
      />
    </FormDialog>
  );
}
