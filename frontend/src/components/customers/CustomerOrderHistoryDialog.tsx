import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useOrders } from '@/hooks/useOrders';
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable';
import { ErrorState } from '@/components/common/ErrorState';
import { toApiError } from '@/services/api';
import type { Customer } from '@/types';

interface CustomerOrderHistoryDialogProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerOrderHistoryDialog({ customer, onClose }: CustomerOrderHistoryDialogProps) {
  const { data, isLoading, error, refetch } = useOrders(
    {
      customerId: customer?.id,
      size: 20,
      sort: 'orderDate',
      sortDirection: 'desc',
    },
    !!customer
  );

  return (
    <Dialog open={!!customer} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Order history - {customer?.firstName} {customer?.lastName}
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error ? (
          <ErrorState message={toApiError(error).message} onRetry={() => void refetch()} />
        ) : (
          <RecentOrdersTable data={isLoading ? [] : (data?.content ?? [])} />
        )}
      </DialogContent>
    </Dialog>
  );
}
