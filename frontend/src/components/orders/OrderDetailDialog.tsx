import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks/useAuth';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { OrderStatusChip } from '@/components/common/OrderStatusChip';
import { ErrorState } from '@/components/common/ErrorState';
import { toApiError } from '@/services/api';
import { canWrite } from '@/constants/permissions';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_TRANSITIONS } from '@/types';
import type { OrderStatus } from '@/types';

interface OrderDetailDialogProps {
  orderId: number | null;
  onClose: () => void;
}

export function OrderDetailDialog({ orderId, onClose }: OrderDetailDialogProps) {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { data: order, isLoading, error, refetch } = useOrder(orderId ?? undefined);
  const updateStatus = useUpdateOrderStatus();

  const handleTransition = async (status: OrderStatus) => {
    if (!order) return;
    try {
      await updateStatus.mutateAsync({ id: order.id, status });
      enqueueSnackbar(`Order marked as ${status}.`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(toApiError(error).message, { variant: 'error' });
    }
  };

  const transitions = order ? ORDER_STATUS_TRANSITIONS[order.status] : [];

  return (
    <Dialog open={orderId !== null} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Order {order ? `#${order.id}` : ''}
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Stack spacing={1}>
            <Skeleton variant="text" height={32} />
            <Skeleton variant="rounded" height={160} />
          </Stack>
        ) : error ? (
          <ErrorState message={toApiError(error).message} onRetry={() => void refetch()} />
        ) : order ? (
          <Box id="invoice-print-area">
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer
                </Typography>
                <Typography>{order.customerName}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order date
                </Typography>
                <Typography>{formatDateTime(order.orderDate)}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" sx={{ alignItems: 'center', mb: 2 }} spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Status:
              </Typography>
              <OrderStatusChip status={order.status} />
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        {item.productName}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {item.sku}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <Typography variant="h6">Total: {formatCurrency(order.totalAmount)}</Typography>
            </Stack>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button startIcon={<PrintOutlinedIcon />} onClick={() => window.print()} disabled={!order}>
          Print
        </Button>
        {order && canWrite(user?.role) && transitions.length > 0 && (
          <Stack direction="row" spacing={1}>
            {transitions.map((status) => (
              <Button
                key={status}
                variant="outlined"
                size="small"
                color={status === 'CANCELLED' ? 'error' : 'primary'}
                loading={updateStatus.isPending}
                onClick={() => handleTransition(status)}
              >
                Mark {status}
              </Button>
            ))}
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
