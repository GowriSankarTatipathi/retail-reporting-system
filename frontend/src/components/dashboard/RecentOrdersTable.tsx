import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { OrderStatusChip } from '@/components/common/OrderStatusChip';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Order } from '@/types';

export function RecentOrdersTable({ data }: { data: Order[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Recent orders will show up here as they come in."
      />
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>#{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{formatDate(order.orderDate)}</TableCell>
              <TableCell>
                <OrderStatusChip status={order.status} />
              </TableCell>
              <TableCell align="right">{formatCurrency(order.totalAmount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
