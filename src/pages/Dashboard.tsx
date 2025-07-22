import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target, 
  Calendar, 
  Zap,
  DollarSign,
  Eye,
  Heart,
  Share2,
  ArrowUpRight,
  Plus
} from "lucide-react";

const statsCards = [
  {
    title: "Total Followers",
    value: "0",
    change: "+0%",
    trend: "up",
    icon: Users,
    color: "accent"
  },
  {
    title: "Engagement Rate",
    value: "0%",
    change: "+0%",
    trend: "up", 
    icon: Heart,
    color: "success"
  },
  {
    title: "Qualified Leads",
    value: "0",
    change: "+0%",
    trend: "up",
    icon: Target,
    color: "primary"
  },
  {
    title: "Campaign ROI",
    value: "$0",
    change: "+0%",
    trend: "up",
    icon: DollarSign,
    color: "warning"
  }
];

const recentPosts: any[] = [];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Marketing Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            SmartEth Auto Marketing Campaign Overview
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Report
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-card-hover transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Posts
            </CardTitle>
            <CardDescription>
              Latest social media activity across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No posts yet. Start by creating your first post!</p>
              </div>
            ) : (
              recentPosts.map((post, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{post.platform}</Badge>
                      <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.engagement.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {post.engagement.shares}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.engagement.comments}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Progress */}
        <div className="space-y-6">
          {/* Campaign Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Campaign Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Followers Goal</span>
                  <span>0 / 10,000</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Lead Generation</span>
                  <span>0 / 500</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Fundraising Progress</span>
                  <span>$0 / $50M</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Generate Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Posts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="accent" className="w-full">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Launch Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}