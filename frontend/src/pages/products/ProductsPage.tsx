import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useDeactivateProduct, useProducts } from '@/hooks/useProducts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { InventoryAdjustDialog } from '@/components/products/InventoryAdjustDialog';
import { toApiError } from '@/services/api';
import { canWrite } from '@/constants/permissions';
import { formatCurrency } from '@/utils/format';
import type { Product } from '@/types';

const ACTIVE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
] as const;

export default function ProductsPage() {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const { enqueueSnackbar } = useSnackbar();
  const deactivateProduct = useDeactivateProduct();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [categoryId, setCategoryId] = useState<number | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<(typeof ACTIVE_FILTERS)[number]['value']>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  const [formState, setFormState] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [inventoryTarget, setInventoryTarget] = useState<Product | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Product | null>(null);

  const { data, isLoading, error, refetch } = useProducts({
    q: debouncedSearch || undefined,
    categoryId: categoryId === 'all' ? undefined : categoryId,
    active: activeFilter === 'all' ? undefined : activeFilter === 'true',
    page: pageIndex,
    size: pageSize,
    sort: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const columns: ColumnDef<Product, unknown>[] = useMemo(
    () => [
      { accessorKey: 'sku', header: 'SKU' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'categoryName', header: 'Category', enableSorting: false },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: (info) => formatCurrency(info.getValue<number>()),
      },
      {
        id: 'stock',
        header: 'Stock',
        enableSorting: false,
        cell: ({ row }) => (
          <Chip
            label={row.original.quantityOnHand}
            size="small"
            color={row.original.lowStock ? 'warning' : 'default'}
            variant={row.original.lowStock ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        accessorKey: 'active',
        header: 'Status',
        enableSorting: false,
        cell: (info) => (
          <Chip
            label={info.getValue<boolean>() ? 'Active' : 'Inactive'}
            size="small"
            color={info.getValue<boolean>() ? 'success' : 'default'}
            variant="outlined"
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            {canWrite(user?.role) && (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormState({ open: true, product: row.original });
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Adjust stock">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInventoryTarget(row.original);
                    }}
                  >
                    <Inventory2OutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {row.original.active && (
                  <Tooltip title="Deactivate">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeactivateTarget(row.original);
                      }}
                    >
                      <BlockOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Stack>
        ),
      },
    ],
    [user?.role]
  );

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateProduct.mutateAsync(deactivateTarget.id);
      enqueueSnackbar('Product deactivated.', { variant: 'success' });
      setDeactivateTarget(null);
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
          Products
        </Typography>
        {canWrite(user?.role) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormState({ open: true, product: null })}
          >
            New product
          </Button>
        )}
      </Stack>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        getRowId={(row) => String(row.id)}
        isLoading={isLoading}
        errorMessage={error ? toApiError(error).message : null}
        onRetry={() => void refetch()}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search or filters."
        manualSorting={{ sorting, onSortingChange: setSorting }}
        pagination={{
          pageIndex,
          pageSize,
          totalRows: data?.totalElements ?? 0,
          onPageChange: setPageIndex,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPageIndex(0);
          },
        }}
        toolbar={
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              select
              size="small"
              label="Category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setPageIndex(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value as typeof activeFilter);
                setPageIndex(0);
              }}
              sx={{ minWidth: 140 }}
            >
              {ACTIVE_FILTERS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
      />

      <ProductFormDialog
        open={formState.open}
        product={formState.product}
        onClose={() => setFormState({ open: false, product: null })}
      />

      <InventoryAdjustDialog
        open={!!inventoryTarget}
        product={inventoryTarget}
        onClose={() => setInventoryTarget(null)}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate product"
        description={`Deactivate "${deactivateTarget?.name}"? It will no longer appear as active in the catalog, but existing orders referencing it are unaffected.`}
        confirmLabel="Deactivate"
        isSubmitting={deactivateProduct.isPending}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </Stack>
  );
}
