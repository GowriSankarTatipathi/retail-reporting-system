import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { useOrders } from '@/hooks/useOrders';
import {
  useLowStockItems,
  useRevenueTrend,
  useTopCustomers,
  useTopProducts,
} from '@/hooks/useReports';
import { KpiCard } from '@/components/common/KpiCard';
import { DashboardPanel } from '@/components/common/DashboardPanel';
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart';
import { TopProductsChart } from '@/components/dashboard/TopProductsChart';
import { TopCustomersList } from '@/components/dashboard/TopCustomersList';
import { LowStockList } from '@/components/dashboard/LowStockList';
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable';
import { formatCurrency, formatNumber } from '@/utils/format';
import { toApiError } from '@/services/api';
import { lastNMonths, lastNDays } from '@/utils/dateRange';
import type { Role } from '@/types';

const REPORTING_ROLES: Role[] = ['ADMIN', 'MANAGER', 'ANALYST'];
const LOOKBACK_OPTIONS = [7, 30, 90] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [lookbackDays, setLookbackDays] = useState<number>(30);

  const canSeeReports = !!user && REPORTING_ROLES.includes(user.role);

  const summary = useDashboardSummary(lookbackDays);
  const recentOrders = useOrders({ size: 5, sort: 'orderDate', sortDirection: 'desc' });

  const revenueTrendRange = useMemo(() => lastNMonths(6), []);
  const topListRange = useMemo(() => lastNDays(lookbackDays), [lookbackDays]);

  const revenueTrend = useRevenueTrend(
    { ...revenueTrendRange, granularity: 'MONTHLY' },
    canSeeReports
  );
  const topProducts = useTopProducts(
    { ...topListRange, limit: 5, sortBy: 'quantity' },
    canSeeReports
  );
  const topCustomers = useTopCustomers({ ...topListRange, limit: 5 }, canSeeReports);
  const lowStock = useLowStockItems(canSeeReports);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        spacing={2}
      >
        <Typography variant="h5" component="h1">
          Dashboard
        </Typography>
        <TextField
          select
          size="small"
          label="Lookback period"
          value={lookbackDays}
          onChange={(e) => setLookbackDays(Number(e.target.value))}
          sx={{ width: 180 }}
        >
          {LOOKBACK_OPTIONS.map((days) => (
            <MenuItem key={days} value={days}>
              Last {days} days
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Total revenue"
            value={summary.data ? formatCurrency(summary.data.totalRevenue) : '-'}
            icon={AttachMoneyOutlinedIcon}
            loading={summary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Total orders"
            value={summary.data ? formatNumber(summary.data.totalOrders) : '-'}
            icon={ReceiptLongOutlinedIcon}
            loading={summary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Avg. order value"
            value={summary.data ? formatCurrency(summary.data.averageOrderValue) : '-'}
            icon={TrendingUpOutlinedIcon}
            loading={summary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Active customers"
            value={summary.data ? formatNumber(summary.data.activeCustomers) : '-'}
            icon={PeopleAltOutlinedIcon}
            loading={summary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Low stock items"
            value={summary.data ? formatNumber(summary.data.lowStockCount) : '-'}
            icon={WarningAmberOutlinedIcon}
            loading={summary.isLoading}
            tone={summary.data && summary.data.lowStockCount > 0 ? 'warning' : 'default'}
          />
        </Grid>
      </Grid>

      {canSeeReports && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <DashboardPanel
              title="Revenue trend (last 6 months)"
              isLoading={revenueTrend.isLoading}
              errorMessage={revenueTrend.error ? toApiError(revenueTrend.error).message : null}
              onRetry={() => void revenueTrend.refetch()}
            >
              <RevenueTrendChart data={revenueTrend.data ?? []} />
            </DashboardPanel>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <DashboardPanel
              title="Top products by units sold"
              isLoading={topProducts.isLoading}
              errorMessage={topProducts.error ? toApiError(topProducts.error).message : null}
              onRetry={() => void topProducts.refetch()}
            >
              <TopProductsChart data={topProducts.data ?? []} />
            </DashboardPanel>
          </Grid>
        </Grid>
      )}

      {canSeeReports && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardPanel
              title="Top customers by spend"
              isLoading={topCustomers.isLoading}
              errorMessage={topCustomers.error ? toApiError(topCustomers.error).message : null}
              onRetry={() => void topCustomers.refetch()}
            >
              <TopCustomersList data={topCustomers.data ?? []} />
            </DashboardPanel>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardPanel
              title="Low stock alerts"
              isLoading={lowStock.isLoading}
              errorMessage={lowStock.error ? toApiError(lowStock.error).message : null}
              onRetry={() => void lowStock.refetch()}
            >
              <LowStockList data={lowStock.data ?? []} />
            </DashboardPanel>
          </Grid>
        </Grid>
      )}

      <DashboardPanel
        title="Recent orders"
        isLoading={recentOrders.isLoading}
        errorMessage={recentOrders.error ? toApiError(recentOrders.error).message : null}
        onRetry={() => void recentOrders.refetch()}
      >
        <RecentOrdersTable data={recentOrders.data?.content ?? []} />
      </DashboardPanel>
    </Stack>
  );
}
