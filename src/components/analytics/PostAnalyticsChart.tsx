import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface PostAnalyticsChartProps {
  data: Array<{
    date: string;
    total: number;
    published: number;
  }>;
}

export const PostAnalyticsChart = ({ data }: PostAnalyticsChartProps) => {
  const chartData = data?.map(item => ({
    date: format(parseISO(item.date), 'MMM dd'),
    total: item.total,
    published: item.published,
    failed: item.total - item.published
  })) || [];

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Post Performance Over Time</CardTitle>
        <CardDescription>Daily breakdown of scheduled vs published posts</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
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
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Total Posts"
            />
            <Line 
              type="monotone" 
              dataKey="published" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              name="Published"
            />
            <Line 
              type="monotone" 
              dataKey="failed" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Failed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};