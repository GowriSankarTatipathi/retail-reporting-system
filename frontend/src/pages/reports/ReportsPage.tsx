import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { KpiCard } from '@/components/common/KpiCard';
import { DashboardPanel } from '@/components/common/DashboardPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart';
import { ReportExportButtons } from '@/components/reports/ReportExportButtons';
import {
  useLowStockItems,
  useRevenueTrend,
  useSalesSummary,
  useTopCustomers,
  useTopProducts,
} from '@/hooks/useReports';
import { toApiError } from '@/services/api';
import { formatCurrency, formatNumber } from '@/utils/format';
import { lastNDays } from '@/utils/dateRange';
import type { ReportGranularity } from '@/types';

const LOOKBACK_OPTIONS = [7, 30, 90, 180] as const;
const TOP_N = 10;

export default function ReportsPage() {
  const [lookbackDays, setLookbackDays] = useState<number>(30);
  const [granularity, setGranularity] = useState<ReportGranularity>('DAILY');

  const dateRange = useMemo(() => lastNDays(lookbackDays), [lookbackDays]);

  const salesSummary = useSalesSummary(dateRange);
  const revenueTrend = useRevenueTrend({ ...dateRange, granularity });
  const topProducts = useTopProducts({ ...dateRange, limit: TOP_N, sortBy: 'revenue' });
  const topCustomers = useTopCustomers({ ...dateRange, limit: TOP_N });
  const lowStock = useLowStockItems();

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        spacing={2}
      >
        <Typography variant="h5" component="h1">
          Reports
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            size="small"
            label="Period"
            value={lookbackDays}
            onChange={(e) => setLookbackDays(Number(e.target.value))}
            sx={{ width: 160 }}
          >
            {LOOKBACK_OPTIONS.map((days) => (
              <MenuItem key={days} value={days}>
                Last {days} days
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Trend granularity"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as ReportGranularity)}
            sx={{ width: 160 }}
          >
            <MenuItem value="DAILY">Daily</MenuItem>
            <MenuItem value="MONTHLY">Monthly</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            label="Total revenue"
            value={salesSummary.data ? formatCurrency(salesSummary.data.totalRevenue) : '-'}
            icon={AttachMoneyOutlinedIcon}
            loading={salesSummary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            label="Total orders"
            value={salesSummary.data ? formatNumber(salesSummary.data.totalOrders) : '-'}
            icon={ReceiptLongOutlinedIcon}
            loading={salesSummary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            label="Avg. order value"
            value={salesSummary.data ? formatCurrency(salesSummary.data.averageOrderValue) : '-'}
            icon={TrendingUpOutlinedIcon}
            loading={salesSummary.isLoading}
          />
        </Grid>
      </Grid>

      <DashboardPanel
        title={`Revenue trend (${granularity === 'DAILY' ? 'daily' : 'monthly'})`}
        action={
          <ReportExportButtons report="revenue-trend" params={{ ...dateRange, granularity }} />
        }
        isLoading={revenueTrend.isLoading}
        errorMessage={revenueTrend.error ? toApiError(revenueTrend.error).message : null}
        onRetry={() => void revenueTrend.refetch()}
      >
        <RevenueTrendChart data={revenueTrend.data ?? []} />
      </DashboardPanel>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardPanel
            title="Top products by revenue"
            action={
              <ReportExportButtons
                report="top-products"
                params={{ ...dateRange, limit: TOP_N, sortBy: 'revenue' }}
              />
            }
            isLoading={topProducts.isLoading}
            errorMessage={topProducts.error ? toApiError(topProducts.error).message : null}
            onRetry={() => void topProducts.refetch()}
          >
            {topProducts.data && topProducts.data.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Qty sold</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.data.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          {product.productName}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {product.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatNumber(product.quantitySold)}</TableCell>
                        <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState title="No sales in this period" description="Try a wider date range." />
            )}
          </DashboardPanel>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardPanel
            title="Top customers by spend"
            action={
              <ReportExportButtons report="top-customers" params={{ ...dateRange, limit: TOP_N }} />
            }
            isLoading={topCustomers.isLoading}
            errorMessage={topCustomers.error ? toApiError(topCustomers.error).message : null}
            onRetry={() => void topCustomers.refetch()}
          >
            {topCustomers.data && topCustomers.data.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Total spent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCustomers.data.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell>
                          {customer.customerName}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {customer.email}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatNumber(customer.orderCount)}</TableCell>
                        <TableCell align="right">{formatCurrency(customer.totalSpent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState title="No customer activity" description="Try a wider date range." />
            )}
          </DashboardPanel>
        </Grid>
      </Grid>

      <DashboardPanel
        title="Low stock items"
        action={<ReportExportButtons report="low-stock" params={{}} />}
        isLoading={lowStock.isLoading}
        errorMessage={lowStock.error ? toApiError(lowStock.error).message : null}
        onRetry={() => void lowStock.refetch()}
      >
        {lowStock.data && lowStock.data.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell align="right">On hand</TableCell>
                  <TableCell align="right">Reorder level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStock.data.map((item) => (
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
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>{item.warehouseLocation ?? '-'}</TableCell>
                    <TableCell align="right">{formatNumber(item.quantityOnHand)}</TableCell>
                    <TableCell align="right">{formatNumber(item.reorderLevel)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            title="Nothing low on stock"
            description="Every product is above its reorder level."
          />
        )}
      </DashboardPanel>
    </Stack>
  );
}
