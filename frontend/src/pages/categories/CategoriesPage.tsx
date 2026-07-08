import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog';
import { toApiError } from '@/services/api';
import { canDelete, canWrite } from '@/constants/permissions';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useCategories();
  const deleteCategory = useDeleteCategory();
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [formState, setFormState] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    const categories = data ?? [];
    if (!debouncedSearch.trim()) return categories;
    const needle = debouncedSearch.trim().toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(needle) || c.description?.toLowerCase().includes(needle)
    );
  }, [data, debouncedSearch]);

  const columns: ColumnDef<Category, unknown>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => info.getValue<string | null>() || '-',
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            {canWrite(user?.role) && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormState({ open: true, category: row.original });
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete(user?.role) && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(row.original);
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [user?.role]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Category deleted.', { variant: 'success' });
      setDeleteTarget(null);
    } catch (error) {
      enqueueSnackbar(toApiError(error).message, { variant: 'error' });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        spacing={2}
      >
        <Typography variant="h5" component="h1">
          Categories
        </Typography>
        {canWrite(user?.role) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormState({ open: true, category: null })}
          >
            New category
          </Button>
        )}
      </Stack>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(row) => String(row.id)}
        isLoading={isLoading}
        errorMessage={error ? toApiError(error).message : null}
        onRetry={() => void refetch()}
        emptyTitle="No categories found"
        emptyDescription={
          debouncedSearch
            ? 'Try a different search term.'
            : 'Create your first category to get started.'
        }
        toolbar={
          <TextField
            size="small"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
        }
      />

      <CategoryFormDialog
        open={formState.open}
        category={formState.category}
        onClose={() => setFormState({ open: false, category: null })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category"
        description={`Delete "${deleteTarget?.name}"? This can't be undone, and will fail if any products still reference it.`}
        confirmLabel="Delete"
        isSubmitting={deleteCategory.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
