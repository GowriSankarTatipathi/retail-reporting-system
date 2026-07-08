import type { ComponentType } from 'react';
import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';

interface KpiCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ fontSize?: 'small' | 'medium' | 'large' }>;
  loading?: boolean;
  tone?: 'default' | 'warning';
}

export function KpiCard({ label, value, icon: Icon, loading, tone = 'default' }: KpiCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: tone === 'warning' ? 'warning.main' : 'primary.main',
              color: (theme) =>
                tone === 'warning'
                  ? theme.palette.warning.contrastText
                  : theme.palette.primary.contrastText,
              opacity: 0.9,
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={90} height={36} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
                {value}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
