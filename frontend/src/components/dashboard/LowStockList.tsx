import { Chip, List, ListItem, ListItemText } from '@mui/material';
import { EmptyState } from '@/components/common/EmptyState';
import type { LowStockItem } from '@/types';

export function LowStockList({ data }: { data: LowStockItem[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="Nothing low on stock"
        description="Every product is above its reorder level."
      />
    );
  }

  return (
    <List dense>
      {data.map((item) => (
        <ListItem key={item.productId} disableGutters>
          <ListItemText
            primary={item.productName}
            secondary={`${item.sku} · ${item.categoryName}`}
          />
          <Chip
            label={`${item.quantityOnHand} / ${item.reorderLevel}`}
            color="warning"
            size="small"
            variant="outlined"
          />
        </ListItem>
      ))}
    </List>
  );
}
