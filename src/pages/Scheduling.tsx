import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePostDialog } from "@/components/scheduling/CreatePostDialog";
import { ScheduledPostCard } from "@/components/scheduling/ScheduledPostCard";
import { SchedulingCalendar } from "@/components/scheduling/SchedulingCalendar";
import { Calendar, List, BarChart3, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedContent } from "@/components/content/ContentLibrary";
import { TwitterSearchDialog } from "@/components/scheduling/TwitterSearchDialog";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledTime: Date;
  platforms: string[];
  status: "scheduled" | "published" | "failed";
  imageUrl?: string;
}

export default function Scheduling() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Load scheduled posts from database
  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      const formattedPosts: ScheduledPost[] = data?.map(post => ({
        id: post.id,
        content: post.content,
        scheduledTime: new Date(post.scheduled_time),
        platforms: post.platforms,
        status: post.status as "scheduled" | "published" | "failed",
        imageUrl: post.image_url || undefined,
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduled posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (newPost: Omit<ScheduledPost, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([{
          content: newPost.content,
          scheduled_time: newPost.scheduledTime.toISOString(),
          platforms: newPost.platforms,
          status: newPost.status,
          image_url: newPost.imageUrl,
          user_id: '00000000-0000-0000-0000-000000000000' // TODO: Replace with actual user ID
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedPost: ScheduledPost = {
          id: data.id,
          content: data.content,
          scheduledTime: new Date(data.scheduled_time),
          platforms: data.platforms,
          status: data.status as "scheduled" | "published" | "failed",
          imageUrl: data.image_url || undefined,
        };
        setPosts(prev => [...prev, formattedPost]);
        toast({
          title: "Success",
          description: "Post scheduled successfully",
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    console.log("Edit post:", post);
    // TODO: Implement edit functionality
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
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
        <div className="flex gap-2">
          <CreatePostDialog 
            onCreatePost={handleCreatePost} 
            availableContent={availableContent}
          />
          <TwitterSearchDialog />
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            All Posts
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Twitter
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
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twitter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Twitter Search & Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Search for tweets by keywords, hashtags, or users to engage with your audience.
              </p>
              <TwitterSearchDialog />
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