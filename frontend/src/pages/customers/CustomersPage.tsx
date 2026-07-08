import { useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';
import { CustomerOrderHistoryDialog } from '@/components/customers/CustomerOrderHistoryDialog';
import { toApiError } from '@/services/api';
import { canDelete, canWrite } from '@/constants/permissions';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const deleteCustomer = useDeleteCustomer();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lastName', desc: false }]);

  const [formState, setFormState] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Customer | null>(null);

  const { data, isLoading, error, refetch } = useCustomers({
    q: debouncedSearch || undefined,
    page: pageIndex,
    size: pageSize,
    sort: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const columns: ColumnDef<Customer, unknown>[] = useMemo(
    () => [
      {
        // id must match a real CustomerResponse field ('lastName') so the
        // sort click sends a `sort=lastName,asc|desc` the backend understands.
        id: 'lastName',
        header: 'Name',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'phone',
        header: 'Phone',
        enableSorting: false,
        cell: (info) => info.getValue<string | null>() || '-',
      },
      {
        accessorKey: 'state',
        header: 'State',
        cell: (info) => info.getValue<string | null>() || '-',
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Order history">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setHistoryTarget(row.original);
                }}
              >
                <HistoryOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canWrite(user?.role) && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormState({ open: true, customer: row.original });
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
      await deleteCustomer.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Customer deleted.', { variant: 'success' });
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
          Customers
        </Typography>
        {canWrite(user?.role) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormState({ open: true, customer: null })}
          >
            New customer
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
        emptyTitle="No customers found"
        emptyDescription="Try a different search term."
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
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
            sx={{ minWidth: 260 }}
          />
        }
      />

      <CustomerFormDialog
        open={formState.open}
        customer={formState.customer}
        onClose={() => setFormState({ open: false, customer: null })}
      />

      <CustomerOrderHistoryDialog customer={historyTarget} onClose={() => setHistoryTarget(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete customer"
        description={`Delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This can't be undone, and will fail if any orders still reference them.`}
        confirmLabel="Delete"
        isSubmitting={deleteCustomer.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
