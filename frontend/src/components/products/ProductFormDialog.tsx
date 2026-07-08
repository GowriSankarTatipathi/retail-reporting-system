import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControlLabel, Grid, MenuItem, Switch, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormDialog } from '@/components/common/FormDialog';
import { FormTextField } from '@/components/forms/FormTextField';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { toApiError } from '@/services/api';
import { productSchema, type ProductFormValues } from '@/validators/catalogSchemas';
import type { Product } from '@/types';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const EMPTY_VALUES: ProductFormValues = {
  sku: '',
  name: '',
  description: '',
  categoryId: 0,
  price: 0,
  costPrice: 0,
  active: true,
  initialQuantity: 0,
  reorderLevel: 10,
  warehouseLocation: '',
};

export function ProductFormDialog({ open, onClose, product }: ProductFormDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              sku: product.sku,
              name: product.name,
              description: product.description ?? '',
              categoryId: product.categoryId,
              price: product.price,
              costPrice: product.costPrice,
              active: product.active,
              reorderLevel: product.reorderLevel,
              warehouseLocation: '',
            }
          : EMPTY_VALUES
      );
      setServerError(null);
    }
  }, [open, product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);
    const request = {
      sku: values.sku,
      name: values.name,
      description: values.description || null,
      categoryId: values.categoryId,
      price: values.price,
      costPrice: values.costPrice,
      active: values.active,
      initialQuantity: product ? undefined : values.initialQuantity,
      reorderLevel: values.reorderLevel,
      warehouseLocation: values.warehouseLocation || null,
    };
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, request });
        enqueueSnackbar('Product updated.', { variant: 'success' });
      } else {
        await createProduct.mutateAsync(request);
        enqueueSnackbar('Product created.', { variant: 'success' });
      }
      onClose();
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  return (
    <FormDialog
      open={open}
      title={product ? 'Edit product' : 'New product'}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      serverError={serverError}
      maxWidth="md"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="sku" control={control} label="SKU" autoFocus />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="categoryId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Category"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value={0} disabled>
                  Select a category
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={12}>
          <FormTextField name="name" control={control} label="Product name" />
        </Grid>
        <Grid size={12}>
          <FormTextField
            name="description"
            control={control}
            label="Description"
            multiline
            minRows={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="price"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ htmlInput: { step: 0.01, min: 0 } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="costPrice"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Cost price"
                type="number"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ htmlInput: { step: 0.01, min: 0 } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="reorderLevel"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Reorder level"
                type="number"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            )}
          />
        </Grid>
        {!product && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="initialQuantity"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Initial quantity"
                  type="number"
                  fullWidth
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              )}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: product ? 12 : 6 }}>
          <FormTextField name="warehouseLocation" control={control} label="Warehouse location" />
        </Grid>
        <Grid size={12}>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Active (visible in catalog)"
              />
            )}
          />
        </Grid>
      </Grid>
    </FormDialog>
  );
}
