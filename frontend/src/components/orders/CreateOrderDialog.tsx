import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Box, IconButton, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useSnackbar } from 'notistack';
import { FormDialog } from '@/components/common/FormDialog';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import { toApiError } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import { orderSchema, type OrderFormValues } from '@/validators/orderSchemas';
import type { Customer, Product } from '@/types';

interface CreateOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Customer/product pickers load a single large page rather than paginating
 * the dropdown itself - a reasonable simplification for this dataset's
 * scale (see docs/requirements.md's single-store assumption); a
 * type-ahead-search combobox would be the next step for a larger catalog.
 */
const PICKER_PAGE_SIZE = 200;

export function CreateOrderDialog({ open, onClose }: CreateOrderDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: customersPage } = useCustomers({ size: PICKER_PAGE_SIZE, sort: 'lastName' }, open);
  const { data: productsPage } = useProducts(
    { size: PICKER_PAGE_SIZE, active: true, sort: 'name' },
    open
  );
  const createOrder = useCreateOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const customers = customersPage?.content ?? [];
  const products = productsPage?.content ?? [];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customerId: 0, items: [{ productId: 0, quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  useEffect(() => {
    if (open) {
      reset({ customerId: 0, items: [{ productId: 0, quantity: 1 }] });
      setServerError(null);
    }
  }, [open, reset]);

  const productById = (id: number): Product | undefined => products.find((p) => p.id === id);

  const estimatedTotal = watchedItems.reduce((sum, item) => {
    const product = productById(item.productId);
    return sum + (product ? product.price * (item.quantity || 0) : 0);
  }, 0);

  const onSubmit = async (values: OrderFormValues) => {
    setServerError(null);
    try {
      await createOrder.mutateAsync(values);
      enqueueSnackbar('Order placed.', { variant: 'success' });
      onClose();
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  return (
    <FormDialog
      open={open}
      title="New order"
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      serverError={serverError}
      submitLabel="Place order"
      maxWidth="md"
    >
      <Controller
        name="customerId"
        control={control}
        render={({ field, fieldState }) => (
          <Autocomplete
            options={customers}
            getOptionLabel={(c: Customer) => `${c.firstName} ${c.lastName} (${c.email})`}
            value={customers.find((c) => c.id === field.value) ?? null}
            onChange={(_e, value) => field.onChange(value?.id ?? 0)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        )}
      />

      <Typography variant="subtitle2">Line items</Typography>
      <Stack spacing={1.5}>
        {fields.map((field, index) => (
          <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Controller
              name={`items.${index}.productId`}
              control={control}
              render={({ field: productField, fieldState }) => (
                <Autocomplete
                  options={products}
                  getOptionLabel={(p: Product) =>
                    `${p.name} (${p.sku}) - ${formatCurrency(p.price)}`
                  }
                  value={products.find((p) => p.id === productField.value) ?? null}
                  onChange={(_e, value) => productField.onChange(value?.id ?? 0)}
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Product"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              )}
            />
            <Controller
              name={`items.${index}.quantity`}
              control={control}
              render={({ field: qtyField, fieldState }) => (
                <TextField
                  label="Qty"
                  type="number"
                  value={qtyField.value}
                  onChange={(e) => qtyField.onChange(Number(e.target.value))}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{ width: 100 }}
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              )}
            />
            <IconButton
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label="Remove line item"
              sx={{ mt: 1 }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      {errors.items?.root && (
        <Typography variant="body2" color="error">
          {errors.items.root.message}
        </Typography>
      )}

      <Box>
        <IconButton
          size="small"
          onClick={() => append({ productId: 0, quantity: 1 })}
          aria-label="Add line item"
        >
          <AddIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
          Add line item
        </Typography>
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'right' }}>
        Estimated total: {formatCurrency(estimatedTotal)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        The server computes the final total from current product prices at order time.
      </Typography>
    </FormDialog>
  );
}
