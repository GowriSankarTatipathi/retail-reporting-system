import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { formatCurrency } from '@/utils/format';
import { EmptyState } from '@/components/common/EmptyState';
import type { TopCustomerPoint } from '@/types';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')
  ).toUpperCase();
}

export function TopCustomersList({ data }: { data: TopCustomerPoint[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No customer activity yet"
        description="Top spenders will appear here once orders come in."
      />
    );
  }

  return (
    <List dense>
      {data.map((customer) => (
        <ListItem key={customer.customerId} disableGutters>
          <ListItemAvatar>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
              {initialsOf(customer.customerName)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={customer.customerName}
            secondary={`${customer.orderCount} order${customer.orderCount === 1 ? '' : 's'}`}
          />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatCurrency(customer.totalSpent)}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
}
