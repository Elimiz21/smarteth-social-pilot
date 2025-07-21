import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Hash, User, MessageCircle, Heart, Repeat2, Reply, Bot, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface TwitterAutomation {
  id?: string;
  name: string;
  search_query: string;
  search_type: 'keywords' | 'hashtags' | 'users';
  action_type: 'reply' | 'post';
  response_template: string;
  is_active: boolean;
  frequency_minutes: number;
  created_at?: string;
}

export function TwitterSearchDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TwitterSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<TwitterSearchResult | null>(null);
  const [automations, setAutomations] = useState<TwitterAutomation[]>([]);
  const [newAutomation, setNewAutomation] = useState<TwitterAutomation>({
    name: "",
    search_query: "",
    search_type: "keywords",
    action_type: "reply",
    response_template: "",
    is_active: true,
    frequency_minutes: 60
  });

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

  const handleCreateAutomation = async () => {
    if (!newAutomation.name || !newAutomation.search_query || !newAutomation.response_template) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // In real implementation, save to database
      const automation: TwitterAutomation = {
        ...newAutomation,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      
      setAutomations(prev => [...prev, automation]);
      setNewAutomation({
        name: "",
        search_query: "",
        search_type: "keywords",
        action_type: "reply",
        response_template: "",
        is_active: true,
        frequency_minutes: 60
      });

      toast({
        title: "Automation Created",
        description: `Created Twitter automation: ${automation.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create automation",
        variant: "destructive",
      });
    }
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, is_active: !auto.is_active } : auto
      )
    );
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(auto => auto.id !== id));
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
          <Bot className="w-4 h-4 mr-2" />
          Twitter Automations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Twitter Automation & Search</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search & Test
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Create Automation
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Manage Automations
            </TabsTrigger>
          </TabsList>

          {/* Search & Test Tab */}
          <TabsContent value="search" className="space-y-6">
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
                            Test Reply
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

            {/* Test Reply Section */}
            {selectedTweet && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Test Reply to @{selectedTweet.author_username}</h3>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground italic">
                      "{selectedTweet.text}"
                    </p>
                  </CardContent>
                </Card>
                <Button variant="outline" onClick={() => setSelectedTweet(null)} className="w-full">
                  Close Preview
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Create Automation Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create New Twitter Automation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="automation-name">Automation Name</Label>
                  <Input
                    id="automation-name"
                    placeholder="e.g., Crypto News Replies"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-type">Search Type</Label>
                  <Select 
                    value={newAutomation.search_type} 
                    onValueChange={(value: 'keywords' | 'hashtags' | 'users') => 
                      setNewAutomation(prev => ({ ...prev, search_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keywords">Keywords</SelectItem>
                      <SelectItem value="hashtags">Hashtags</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <Input
                  id="search-query"
                  placeholder="e.g., Bitcoin, #crypto, @username"
                  value={newAutomation.search_query}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, search_query: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select 
                    value={newAutomation.action_type} 
                    onValueChange={(value: 'reply' | 'post') => 
                      setNewAutomation(prev => ({ ...prev, action_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reply">Reply to Tweets</SelectItem>
                      <SelectItem value="post">Create New Posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Check Frequency (minutes)</Label>
                  <Select 
                    value={newAutomation.frequency_minutes.toString()} 
                    onValueChange={(value) => 
                      setNewAutomation(prev => ({ ...prev, frequency_minutes: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="120">Every 2 hours</SelectItem>
                      <SelectItem value="240">Every 4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-template">Response Template</Label>
                <Textarea
                  id="response-template"
                  placeholder={newAutomation.action_type === 'reply' 
                    ? "Write your reply template here. Use {username} and {content} placeholders."
                    : "Write your post template here. Use {query} and {timestamp} placeholders."
                  }
                  value={newAutomation.response_template}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, response_template: e.target.value }))}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {newAutomation.action_type === 'reply' 
                    ? "Available placeholders: {username}, {content}, {query}"
                    : "Available placeholders: {query}, {timestamp}, {date}"
                  }
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="automation-active"
                  checked={newAutomation.is_active}
                  onCheckedChange={(checked) => setNewAutomation(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="automation-active">Start automation immediately</Label>
              </div>

              <Button onClick={handleCreateAutomation} className="w-full">
                Create Automation
              </Button>
            </div>
          </TabsContent>

          {/* Manage Automations Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Automations</h3>
              
              {automations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No automations created yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("create")}
                    >
                      Create Your First Automation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {automations.map((automation) => (
                    <Card key={automation.id} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{automation.name}</h4>
                              <Badge variant={automation.is_active ? "default" : "secondary"}>
                                {automation.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {automation.action_type === 'reply' ? 'Reply Bot' : 'Post Bot'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {automation.search_type}: "{automation.search_query}" • Every {automation.frequency_minutes}min
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={automation.is_active}
                              onCheckedChange={() => toggleAutomation(automation.id!)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAutomation(automation.id!)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Response Template:</Label>
                          <p className="text-sm bg-muted p-2 rounded text-muted-foreground">
                            {automation.response_template}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}