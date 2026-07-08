import { useTheme } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/utils/format';
import type { RevenueTrendPoint } from '@/types';

export function RevenueTrendChart({ data }: { data: RevenueTrendPoint[] }) {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
            <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke={theme.palette.text.secondary}
          tickFormatter={(value: number) => formatCurrency(value)}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            borderRadius: 8,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
