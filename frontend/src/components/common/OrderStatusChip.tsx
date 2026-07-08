import { Chip, type ChipProps } from '@mui/material';
import type { OrderStatus } from '@/types';

const COLOR_BY_STATUS: Record<OrderStatus, ChipProps['color']> = {
  PENDING: 'default',
  PROCESSING: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <Chip label={status} color={COLOR_BY_STATUS[status]} size="small" variant="outlined" />;
}
