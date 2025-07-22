import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScheduleHeatmapProps {
  hourlyData: Array<{
    hour: number;
    total: number;
    successful: number;
    success_rate: number;
  }>;
  weeklyData: Array<{
    day: string;
    total: number;
    successful: number;
    success_rate: number;
  }>;
}

export const ScheduleHeatmap = ({ hourlyData, weeklyData }: ScheduleHeatmapProps) => {
  const getHeatmapColor = (successRate: number) => {
    if (successRate >= 90) return 'bg-success/80';
    if (successRate >= 75) return 'bg-success/60';
    if (successRate >= 50) return 'bg-warning/60';
    if (successRate > 0) return 'bg-destructive/60';
    return 'bg-muted';
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Posting Schedule Analysis</CardTitle>
        <CardDescription>Success rates by time and day</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hourly Distribution */}
        <div>
          <h4 className="text-sm font-medium mb-3">Best Posting Hours</h4>
          <div className="grid grid-cols-12 gap-1">
            {hours.map((hour) => {
              const data = hourlyData?.find(h => h.hour === hour);
              const successRate = data?.success_rate || 0;
              return (
                <div
                  key={hour}
                  className={`h-8 rounded flex items-center justify-center text-xs font-medium ${getHeatmapColor(successRate)}`}
                  title={`${hour}:00 - ${data?.total || 0} posts, ${successRate}% success rate`}
                >
                  {hour}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>12AM</span>
            <span>12PM</span>
            <span>11PM</span>
          </div>
        </div>

        {/* Weekly Distribution */}
        <div>
          <h4 className="text-sm font-medium mb-3">Best Posting Days</h4>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const data = weeklyData?.find(d => d.day === day);
              const successRate = data?.success_rate || 0;
              return (
                <div
                  key={day}
                  className={`h-12 rounded flex flex-col items-center justify-center text-xs font-medium ${getHeatmapColor(successRate)}`}
                  title={`${day} - ${data?.total || 0} posts, ${successRate}% success rate`}
                >
                  <span>{day.slice(0, 3)}</span>
                  <span className="text-[10px] opacity-80">{successRate}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-muted"></div>
            <span>No data</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-destructive/60"></div>
            <span>&lt;50%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-warning/60"></div>
            <span>50-75%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-success/60"></div>
            <span>75-90%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-success/80"></div>
            <span>90%+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};