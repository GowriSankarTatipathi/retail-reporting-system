import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { DataTable } from '@/components/common/DataTable';
import { OrderStatusChip } from '@/components/common/OrderStatusChip';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { toApiError } from '@/services/api';
import { canWrite } from '@/constants/permissions';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { Order, OrderStatus } from '@/types';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function OrdersPage() {
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'orderDate', desc: true }]);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useOrders({
    status: statusFilter || undefined,
    page: pageIndex,
    size: pageSize,
    sort: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const columns: ColumnDef<Order, unknown>[] = useMemo(
    () => [
      { accessorKey: 'id', header: 'Order #', cell: (info) => `#${info.getValue<number>()}` },
      { accessorKey: 'customerName', header: 'Customer', enableSorting: false },
      {
        accessorKey: 'orderDate',
        header: 'Order date',
        cell: (info) => formatDateTime(info.getValue<string>()),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => <OrderStatusChip status={info.getValue<OrderStatus>()} />,
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: (info) => formatCurrency(info.getValue<number>()),
      },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        spacing={2}
      >
        <Typography variant="h5" component="h1">
          Orders
        </Typography>
        {canWrite(user?.role) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New order
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
        emptyTitle="No orders found"
        emptyDescription="Try a different status filter, or place a new order."
        onRowClick={(row) => setDetailOrderId(row.id)}
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
          <TextField
            size="small"
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | '');
              setPageIndex(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      <CreateOrderDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <OrderDetailDialog orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />
    </Stack>
  );
}
