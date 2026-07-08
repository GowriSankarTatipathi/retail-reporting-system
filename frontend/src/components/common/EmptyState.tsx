import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Consistent "nothing here yet" treatment for tables, lists, and chart panels. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack
      spacing={1}
      sx={{ alignItems: 'center', justifyContent: 'center', py: 6, textAlign: 'center' }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
