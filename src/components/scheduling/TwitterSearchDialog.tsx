import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Hash, User, MessageCircle, Heart, Repeat2, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwitterSearchResult {
  id: string;
  text: string;
  author_name: string;
  author_username: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

export function TwitterSearchDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TwitterSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedTweet, setSelectedTweet] = useState<TwitterSearchResult | null>(null);

  const handleSearch = async (type: 'keywords' | 'hashtags' | 'users') => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would call Twitter API
      // For now, we'll show mock data
      const mockResults: TwitterSearchResult[] = [
        {
          id: "1",
          text: type === 'keywords' 
            ? `Great insights about ${searchQuery}! This is exactly what we needed to understand the market trends.`
            : type === 'hashtags'
            ? `Just discovered this amazing ${searchQuery} thread. The community is really growing! 🚀`
            : `@${searchQuery} has been doing incredible work in the crypto space. Really impressed with their analysis.`,
          author_name: "Crypto Analyst",
          author_username: "cryptoanalyst",
          created_at: "2024-01-21T10:30:00Z",
          public_metrics: {
            like_count: 15,
            retweet_count: 3,
            reply_count: 2
          }
        },
        {
          id: "2", 
          text: type === 'keywords'
            ? `The ${searchQuery} market is showing interesting patterns. Here's my take on where we're heading...`
            : type === 'hashtags'
            ? `Another perspective on ${searchQuery} - the technology behind this is fascinating!`
            : `Following @${searchQuery} for their daily insights. Always learning something new!`,
          author_name: "DeFi Explorer",
          author_username: "defiexplorer",
          created_at: "2024-01-21T09:15:00Z",
          public_metrics: {
            like_count: 28,
            retweet_count: 7,
            reply_count: 5
          }
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchResults(mockResults);
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} tweets`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search tweets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (tweet: TwitterSearchResult) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    try {
      // In real implementation, this would call the Twitter API to post a reply
      toast({
        title: "Reply Sent",
        description: `Replied to @${tweet.author_username}`,
      });
      setReplyText("");
      setSelectedTweet(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Search Twitter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Twitter Search & Engagement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Query</Label>
              <Input
                id="search"
                placeholder="Enter keywords, #hashtags, or @usernames"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="keywords" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="keywords" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Keywords
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Hashtags
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="keywords" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Search for tweets containing specific keywords or phrases
                </p>
                <Button 
                  onClick={() => handleSearch('keywords')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Searching..." : "Search Keywords"}
                </Button>
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Find tweets with specific hashtags (include # in your search)
                </p>
                <Button 
                  onClick={() => handleSearch('hashtags')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Searching..." : "Search Hashtags"}
                </Button>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Search for tweets from specific users (include @ in your search)
                </p>
                <Button 
                  onClick={() => handleSearch('users')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Searching..." : "Search Users"}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Results Section */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.map((tweet) => (
                  <Card key={tweet.id} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{tweet.author_name}</span>
                            <span className="text-muted-foreground">@{tweet.author_username}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatDate(tweet.created_at)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTweet(tweet)}
                        >
                          <Reply className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm leading-relaxed">{tweet.text}</p>
                      
                      {tweet.public_metrics && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {tweet.public_metrics.reply_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="w-3 h-3" />
                            {tweet.public_metrics.retweet_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {tweet.public_metrics.like_count}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reply Section */}
          {selectedTweet && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Reply to @{selectedTweet.author_username}</h3>
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground italic">
                    "{selectedTweet.text}"
                  </p>
                </CardContent>
              </Card>
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleReply(selectedTweet)}>
                  Send Reply
                </Button>
                <Button variant="outline" onClick={() => setSelectedTweet(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}