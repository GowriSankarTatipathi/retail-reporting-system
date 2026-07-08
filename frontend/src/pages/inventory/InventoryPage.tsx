import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DataTable } from '@/components/common/DataTable';
import { InventoryAdjustDialog } from '@/components/products/InventoryAdjustDialog';
import { toApiError } from '@/services/api';
import { canWrite } from '@/constants/permissions';
import type { Product } from '@/types';

/**
 * A focused, stock-oriented view over the same product catalog Products
 * page uses - the backend has no separate "list all inventory" endpoint
 * (stock lives on the product record itself, see ProductResponse.java), so
 * this reuses GET /api/v1/products rather than inventing one. A dedicated
 * stock-adjustment ledger/history is a real, documented gap (see ROADMAP.md
 * "Inventory adjustment history") - this page shows the current snapshot,
 * not a history, because that's genuinely all the API can provide today.
 */
export default function InventoryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'quantityOnHand', desc: false }]);
  const [inventoryTarget, setInventoryTarget] = useState<Product | null>(null);

  const { data, isLoading, error, refetch } = useProducts({
    q: debouncedSearch || undefined,
    active: true,
    page: pageIndex,
    size: pageSize,
    sort: sorting[0]?.id === 'quantityOnHand' ? undefined : sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const rows = useMemo(() => {
    const content = data?.content ?? [];
    const filtered = lowStockOnly ? content.filter((p) => p.lowStock) : content;
    // quantityOnHand isn't a backend-sortable field (Pageable only sorts persisted
    // columns it exposes), so that one sort option is applied client-side on the
    // current page instead.
    if (sorting[0]?.id === 'quantityOnHand') {
      const dir = sorting[0]?.desc ? -1 : 1;
      return [...filtered].sort((a, b) => dir * (a.quantityOnHand - b.quantityOnHand));
    }
    return filtered;
  }, [data, lowStockOnly, sorting]);

  const columns: ColumnDef<Product, unknown>[] = useMemo(
    () => [
      { accessorKey: 'sku', header: 'SKU' },
      { accessorKey: 'name', header: 'Product', enableSorting: false },
      { accessorKey: 'quantityOnHand', header: 'On hand' },
      { accessorKey: 'reorderLevel', header: 'Reorder level', enableSorting: false },
      {
        id: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.lowStock ? (
            <Chip label="Low stock" color="warning" size="small" />
          ) : (
            <Chip label="OK" color="success" size="small" variant="outlined" />
          ),
      },
      ...(canWrite(user?.role)
        ? [
            {
              id: 'actions',
              header: 'Actions',
              enableSorting: false,
              cell: ({ row }: { row: { original: Product } }) => (
                <Tooltip title="Adjust stock">
                  <IconButton size="small" onClick={() => setInventoryTarget(row.original)}>
                    <Inventory2OutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ),
            } satisfies ColumnDef<Product, unknown>,
          ]
        : []),
    ],
    [user?.role]
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h1">
        Inventory
      </Typography>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => String(row.id)}
        isLoading={isLoading}
        errorMessage={error ? toApiError(error).message : null}
        onRetry={() => void refetch()}
        emptyTitle="No stock records found"
        emptyDescription={
          lowStockOnly ? 'Nothing is currently low on stock.' : 'Try a different search.'
        }
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
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
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
            <FormControlLabel
              control={
                <Switch
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                />
              }
              label="Low stock only"
            />
          </Stack>
        }
      />

      <InventoryAdjustDialog
        open={!!inventoryTarget}
        product={inventoryTarget}
        onClose={() => setInventoryTarget(null)}
      />
    </Stack>
  );
}
