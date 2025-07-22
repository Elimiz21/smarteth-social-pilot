import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar as CalendarIcon,
  Activity,
  Target,
  Users,
  Clock,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MetricsCard } from "@/components/analytics/MetricsCard";
import { PostAnalyticsChart } from "@/components/analytics/PostAnalyticsChart";
import { PlatformStatsChart } from "@/components/analytics/PlatformStatsChart";
import { ScheduleHeatmap } from "@/components/analytics/ScheduleHeatmap";

interface AnalyticsData {
  posts?: {
    total_posts: number;
    published_posts: number;
    failed_posts: number;
    success_rate: number;
    platform_stats: Array<{
      platform: string;
      count: number;
      published: number;
      success_rate: number;
    }>;
    daily_stats: Array<{
      date: string;
      total: number;
      published: number;
    }>;
  };
  schedule?: {
    hourly_distribution: Array<{
      hour: number;
      total: number;
      successful: number;
      success_rate: number;
    }>;
    day_of_week_distribution: Array<{
      day: string;
      total: number;
      successful: number;
      success_rate: number;
    }>;
    optimal_posting_times: Array<{
      hour: number;
      success_rate: number;
    }>;
  };
  engagement?: {
    avg_engagement_rate: number;
    top_performing_posts: any[];
    platform_engagement: any[];
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');

      const { data, error } = await supabase.functions.invoke('analytics', {
        body: JSON.stringify({ 
          start_date: startDate,
          end_date: endDate,
          type: 'overview'
        })
      });

      if (error) {
        console.error('Analytics fetch error:', error);
        toast({
          title: "Error loading analytics",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error: any) {
      console.error('Analytics error:', error);
      toast({
        title: "Error loading analytics",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, dateRange]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const now = new Date();
    let from: Date;

    switch (value) {
      case "7d":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setDateRange({ from, to: now });
  };

  const posts = analyticsData.posts || {
    total_posts: 0,
    published_posts: 0,
    failed_posts: 0,
    success_rate: 0,
    platform_stats: [],
    daily_stats: []
  };
  const schedule = analyticsData.schedule || {
    hourly_distribution: [],
    day_of_week_distribution: [],
    optimal_posting_times: []
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please log in to view analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track performance across all social media platforms
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range: any) => range && setDateRange(range)}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="outline" 
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="Total Posts"
              value={posts.total_posts || 0}
              description="Posts scheduled in period"
              icon={Activity}
            />
            <MetricsCard
              title="Published Posts"
              value={posts.published_posts || 0}
              description="Successfully published"
              icon={Target}
            />
            <MetricsCard
              title="Success Rate"
              value={`${posts.success_rate || 0}%`}
              description="Publishing success rate"
              icon={TrendingUp}
            />
            <MetricsCard
              title="Active Platforms"
              value={posts.platform_stats?.length || 0}
              description="Platforms in use"
              icon={Users}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-7">
            <PostAnalyticsChart data={posts.daily_stats || []} />
            <PlatformStatsChart data={posts.platform_stats || []} />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ScheduleHeatmap 
              hourlyData={schedule.hourly_distribution || []}
              weeklyData={schedule.day_of_week_distribution || []}
            />
            
            {/* Optimal Posting Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Best Posting Times
                </CardTitle>
                <CardDescription>Hours with highest success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.optimal_posting_times?.slice(0, 5).map((time: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">
                          {String(time.hour).padStart(2, '0')}:00
                        </span>
                      </div>
                      <span className="text-sm text-success font-medium">
                        {time.success_rate}%
                      </span>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No data available yet. Schedule some posts to see insights!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}