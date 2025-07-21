import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePostDialog } from "@/components/scheduling/CreatePostDialog";
import { ScheduledPostCard } from "@/components/scheduling/ScheduledPostCard";
import { SchedulingCalendar } from "@/components/scheduling/SchedulingCalendar";
import { Calendar, List, BarChart3 } from "lucide-react";
import type { GeneratedContent } from "@/components/content/ContentLibrary";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledTime: Date;
  platforms: string[];
  status: "scheduled" | "published" | "failed";
  imageUrl?: string;
}

export default function Scheduling() {
  // Mock data - in real app this would come from content generation
  const availableContent: GeneratedContent[] = [
    {
      id: "content-1",
      content: "🚀 SmartEth's regulated approach to ETH asset management continues to deliver exceptional results for institutional clients. Our cutting-edge DeFi integration provides the security and transparency modern investors demand. #SmartETH #InstitutionalCrypto #DeFi",
      type: "tweet",
      audience: "investors",
      tone: "professional", 
      platforms: ["twitter", "linkedin"],
      keywords: ["SmartETH", "DeFi", "institutional"],
      engagementScore: 8.5,
      createdAt: new Date(Date.now() - 86400000),
      status: "approved",
    },
    {
      id: "content-2",
      content: "The future of crypto asset management lies in regulation and innovation working together. SmartEth's Israeli regulatory framework provides the foundation for sustainable growth in the digital asset space.",
      type: "linkedin",
      audience: "investors", 
      tone: "authoritative",
      platforms: ["linkedin"],
      keywords: ["regulation", "innovation", "digital assets"],
      engagementScore: 9.2,
      createdAt: new Date(Date.now() - 172800000),
      status: "approved",
    },
  ];

  const [posts, setPosts] = useState<ScheduledPost[]>([
    {
      id: "1",
      content: "🚀 Exciting announcement coming tomorrow! Stay tuned for something amazing. #Innovation #TechNews",
      scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
      platforms: ["twitter", "linkedin"],
      status: "scheduled",
    },
    {
      id: "2",
      content: "Behind the scenes at our latest product development. The team is working hard to bring you the best experience possible!",
      scheduledTime: new Date(Date.now() + 172800000), // Day after tomorrow
      platforms: ["facebook", "instagram"],
      status: "scheduled",
    },
  ]);

  const handleCreatePost = (newPost: ScheduledPost) => {
    setPosts(prev => [...prev, newPost]);
  };

  const handleEditPost = (post: ScheduledPost) => {
    console.log("Edit post:", post);
    // TODO: Implement edit functionality
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  const handleDateSelect = (date: Date) => {
    console.log("Selected date:", date);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Social Media Scheduling
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and schedule your content across all platforms
          </p>
        </div>
        <CreatePostDialog 
          onCreatePost={handleCreatePost} 
          availableContent={availableContent}
        />
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            All Posts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <SchedulingCalendar posts={posts} onDateSelect={handleDateSelect} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Posts ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <ScheduledPostCard
                    key={post.id}
                    post={post}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
              {posts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No scheduled posts yet. Create your first post to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border border-border/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Scheduled</div>
                </div>
                <div className="text-center p-4 border border-border/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {posts.filter(p => p.status === "published").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
                <div className="text-center p-4 border border-border/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {posts.filter(p => p.status === "scheduled").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}