import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlatformStatsChartProps {
  data: Array<{
    platform: string;
    count: number;
    published: number;
    success_rate: number;
  }>;
}

export const PlatformStatsChart = ({ data }: PlatformStatsChartProps) => {
  const chartData = data?.map(item => ({
    platform: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
    total: item.count,
    published: item.published,
    failed: item.count - item.published,
    successRate: item.success_rate
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Performance</CardTitle>
        <CardDescription>Posts published by platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="platform"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar 
              dataKey="published" 
              fill="hsl(var(--success))" 
              name="Published"
            />
            <Bar 
              dataKey="failed" 
              fill="hsl(var(--destructive))" 
              name="Failed"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};