import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { FormDialog } from '@/components/common/FormDialog';
import { FormTextField } from '@/components/forms/FormTextField';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { toApiError } from '@/services/api';
import { categorySchema, type CategoryFormValues } from '@/validators/catalogSchemas';
import type { Category } from '@/types';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Present when editing; absent when creating a new category. */
  category?: Category | null;
}

export function CategoryFormDialog({ open, onClose, category }: CategoryFormDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: category?.name ?? '', description: category?.description ?? '' });
      setServerError(null);
    }
  }, [open, category, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    setServerError(null);
    const request = { name: values.name, description: values.description || null };
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, request });
        enqueueSnackbar('Category updated.', { variant: 'success' });
      } else {
        await createCategory.mutateAsync(request);
        enqueueSnackbar('Category created.', { variant: 'success' });
      }
      onClose();
    } catch (error) {
      setServerError(toApiError(error).message);
    }
  };

  return (
    <FormDialog
      open={open}
      title={category ? 'Edit category' : 'New category'}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      serverError={serverError}
    >
      <FormTextField name="name" control={control} label="Name" autoFocus />
      <FormTextField
        name="description"
        control={control}
        label="Description"
        multiline
        minRows={2}
      />
    </FormDialog>
  );
}
