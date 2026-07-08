import { useTheme } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNumber } from '@/utils/format';
import type { TopProductPoint } from '@/types';

export function TopProductsChart({ data }: { data: TopProductPoint[] }) {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          stroke={theme.palette.text.secondary}
          tickFormatter={(value: number) => formatNumber(value)}
        />
        <YAxis
          type="category"
          dataKey="productName"
          tick={{ fontSize: 12 }}
          stroke={theme.palette.text.secondary}
          width={120}
        />
        <Tooltip
          formatter={(value) => formatNumber(Number(value))}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            borderRadius: 8,
          }}
        />
        <Bar
          dataKey="quantitySold"
          name="Units sold"
          fill={theme.palette.primary.main}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
